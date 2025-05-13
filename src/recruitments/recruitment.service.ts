import { Injectable } from "@nestjs/common";
import { FirebaseService } from "src/firebase/firebase.service";
import * as fs from 'fs';
const PdfParse = require('pdf-parse');
import axios from "axios";
import { PineconeService } from "./pinecone.service";
import { ConfigService } from "@nestjs/config";
import { ApplicationStatus } from "src/applications/enums/application-status.enum";

export interface BatchResult {
    id: string;
    success: boolean;
    error?: string;
}

export interface PreselectionResult {
    success: boolean;
    vacancyId: string;
    totalApplications: number;
    processedCount: number;
    successfulCount: number;
    failureCount: number;
    batches: BatchResult[];
}

@Injectable()
export class RecluitmentService {
    private collectionProgramdores;
    private collectionApplications;
    private collectionVacancies;

    constructor(
        private firebaseService: FirebaseService,
        private pineconeService: PineconeService,
        private configService: ConfigService
    ) {
        this.collectionProgramdores = this.firebaseService.getFirestore().collection('programadores');
        this.collectionApplications = this.firebaseService.getFirestore().collection('applications');
        this.collectionVacancies = this.firebaseService.getFirestore().collection('vacancies');
    }

    async saveData() {
        try {
            const data = JSON.parse(fs.readFileSync('src/recruitments/dto/data.json', 'utf8'));

            for (const candidato of data) {
                await this.collectionProgramdores.add(candidato);
            }

            return "Datos subidos correctamente.";
        } catch (error) {
            console.error("Error al subir los datos:", error);
            throw new Error("No se pudieron subir los datos.");
        }
    }

    async deleteAll() {
        const snapshot = await this.collectionProgramdores.get();

        const batch = this.firebaseService.getFirestore().batch();

        snapshot.forEach(doc => {
            batch.delete(doc.ref);
        });

        await batch.commit();

        return "Todos los documentos han sido eliminados.";
    }

    async preselection(vacancyId: string, limit: number, options: { 
        batchSize?: number, 
        delayBetweenBatches?: number,
        maxApplications?: number 
    } = {
        batchSize: 10,
        delayBetweenBatches: 1000,
        maxApplications: 200
    }): Promise<PreselectionResult> {
        try {
            // 1. Configuración inicial
            const vectorStore = await this.pineconeService.getVectorStore("cv-index");
            
            // 2. Obtener información de la vacante
            const vacancyQuery = await this.collectionVacancies
                .doc(vacancyId)
                .get();
          
            if (vacancyQuery.empty) {
                throw new Error(`No se encontró la vacante con ID: ${vacancyId}`);
            }
          
            const vacancyData = vacancyQuery.data();
            const vacancyDescription = `${vacancyData.descripcion || ''}\n\nResponsabilidades:\n${vacancyData.responsabilidades || ''}`;
    
            // 3. Obtener el total de aplicaciones
            const countQuery = this.collectionProgramdores
                .where("vacancyId", '==', vacancyId)
                .where("status", "==", ApplicationStatus.RECEIVED)
                .limit(options.maxApplications);
            
            const totalSnapshot = await countQuery.get();
            const totalApplications = totalSnapshot.size;
            
            if (totalApplications === 0) {
                return {
                    success: true,
                    vacancyId,
                    totalApplications: 0,
                    processedCount: 0,
                    successfulCount: 0,
                    failureCount: 0,
                    batches: []
                };
            }
    
            // 4. Procesamiento por lotes
            const allBatches: BatchResult[] = [];
            let processedCount = 0;
            let lastDoc = null;
    
            while (processedCount < totalApplications) {
                // Obtener el siguiente lote
                let batchQuery = this.collectionProgramdores
                    .where("vacancyId", '==', vacancyId)
                    .where("status", "==", ApplicationStatus.RECEIVED)
                    .limit(options.batchSize);
    
                if (lastDoc) {
                    batchQuery = batchQuery.startAfter(lastDoc);
                }
    
                const batchSnapshot = await batchQuery.get();
                
                if (batchSnapshot.empty) break;
    
                // Procesar el lote actual
                const batchApplications = batchSnapshot.docs.map(doc => ({
                    id: doc.id,
                    ...doc.data(),
                    docRef: doc.ref
                }));
    
                const batchResults = await this.processBatch(
                    batchApplications, 
                    vacancyId, 
                    vectorStore
                );
    
                allBatches.push(...batchResults);
                processedCount += batchApplications.length;
                lastDoc = batchSnapshot.docs[batchSnapshot.docs.length - 1];
    
                // Delay entre lotes
                if (processedCount < totalApplications) {
                    await new Promise(resolve => 
                        setTimeout(resolve, options.delayBetweenBatches)
                    );
                }
            }
    
            // 5. Buscar los mejores candidatos
            const results = await vectorStore.similaritySearchWithScore(vacancyDescription, limit);
    
            // 6. Actualizar estado de los candidatos seleccionados
            const updatePromises = results.map(async ([document]) => {
                const candidateId = document.metadata.candidateId;
                const docRef = this.collectionProgramdores.doc(candidateId);
                
                try {
                    await docRef.update({
                        status: ApplicationStatus.IN_REVIEW,
                        lastProcessedAt: new Date().toISOString()
                    });
                
                } catch (error) {
                    console.error(`Error updating candidate ${candidateId}:`, error);
                }
            });
    
            await Promise.all(updatePromises);
    
            // 7. Generar reporte final
            const successfulCount = allBatches.filter(r => r.success).length;
            const failureCount = allBatches.filter(r => !r.success).length;
    
            return {
                success: true,
                vacancyId,
                totalApplications,
                processedCount,
                successfulCount,
                failureCount,
                batches: allBatches,
                
            };
    
        } catch (error) {
            console.error('Error en preselection masiva:', error);
            return {
                success: false,
                vacancyId,
                totalApplications: 0,
                processedCount: 0,
                successfulCount: 0,
                failureCount: 0,
                batches: [],
            };
        }
    }
    
    private async processBatch(applications: any[], vacancyId: string, vectorStore: any) {
        return Promise.all(
            applications.map(async (app) => {
                try {
                    if (!app.cvPath) {
                        return { id: app.id, success: false, error: "No tiene CV" };
                    }
    
                    // Extraer texto con timeout
                    const text = await this.extractTextWithTimeout(app.cvPath, 30000);
                    
                    // Almacenar en Pinecone
                    await vectorStore.addDocuments(
                        [{
                            pageContent: text,
                            metadata: {
                                candidateId: app.id,
                                vacancyId,
                                processedAt: new Date().toISOString()
                            }
                        }],
                        [app.id]
                    );
    
                    // Actualizar Firestore
                    await app.docRef.update({
                        cvProcessed: true,
                        lastProcessedAt: new Date().toISOString(),
                        processingStatus: "completed",
                        status: ApplicationStatus.DISCARDED
                    });
    
                    return { id: app.id, success: true };
    
                } catch (error) {
                    await app.docRef.update({
                        processingStatus: "failed",
                        error: error.message.substring(0, 500)
                    });
                    
                    return { 
                        id: app.id, 
                        success: false, 
                        error: error.message 
                    };
                }
            })
        );
    }
    
    private async extractTextWithTimeout(pdfUrl: string, timeoutMs: number) {
        const controller = new AbortController();
        const timeout = setTimeout(() => controller.abort(), timeoutMs);
    
        try {
            const response = await axios.get(pdfUrl, { 
                responseType: 'arraybuffer',
                signal: controller.signal 
            });
            
            const data = await PdfParse(response.data);
            return data.text;
        } finally {
            clearTimeout(timeout);
        }
    }

    async deleteIndex(){
        await this.pineconeService.deleteIndex("cv-index");
        return "eliminado información del index";
    }
}