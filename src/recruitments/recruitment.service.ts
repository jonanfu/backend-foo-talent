import { Injectable } from "@nestjs/common";
import { FirebaseService } from "src/firebase/firebase.service";
import * as fs from 'fs';
const PdfParse = require('pdf-parse');
import axios from "axios";
import { PineconeService } from "./pinecone.service";
import { ApplicationStatus } from "src/applications/enums/application-status.enum";
import { NotificationService } from "src/notifications/notification.service";
import { VacanciesService } from "src/vacancies/vacancies.service";
import { VacancyStatus } from "src/vacancies/dto/create-vacancy.dto";

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
        private notificationService: NotificationService,
        private vacancyService: VacanciesService
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

    async getAllProgramadores() {
        const snapshot = await this.collectionProgramdores.get(); // Obtiene todos los documentos

        if (snapshot.empty) {
            return []; // Si no hay documentos, retorna un arreglo vacío
        }

        // Mapea los documentos a un array de objetos con sus datos e ID
        const programadores = snapshot.docs.map((doc) => ({
            id: doc.id,
            ...doc.data(),
        }));

        return programadores;
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
            const vacancyDoc = await this.collectionVacancies.doc(vacancyId).get();
            if (!vacancyDoc.exists) {
                throw new Error(`No se encontró la vacante con ID: ${vacancyId}`);
            }

            const vacancyData = vacancyDoc.data();
            const vacancyDescription = `${vacancyData.descripcion || ''}\n\nResponsabilidades:\n${vacancyData.responsabilidades || ''}`;

            // 3. Obtener el total de aplicaciones
            const query = this.collectionApplications
                .where("vacancyId", '==', vacancyId)
                .where("status", "==", ApplicationStatus.RECEIVED)
                .limit(options.maxApplications);

            const snapshot = await query.get();
            const totalApplications = snapshot.size;

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

            // 4. Procesar todos los CVs sin cambiar el estado
            const allCandidates = snapshot.docs.map(doc => ({
                id: doc.id,
                ...doc.data(),
                docRef: doc.ref
            }));

            // Procesar en lotes para evitar sobrecarga
            const batchSize = options.batchSize || 10;
            const batches: BatchResult[] = [];

            for (let i = 0; i < allCandidates.length; i += batchSize) {
                const batch = allCandidates.slice(i, i + batchSize);
                const batchResults = await this.processBatch(batch, vacancyId, vectorStore, false);
                batches.push(...batchResults);

                if (i + batchSize < allCandidates.length) {
                    await new Promise(resolve => setTimeout(resolve, options.delayBetweenBatches || 1000));
                }
            }

            const filter = {
                vacancyId: { $eq: vacancyId }     
            };
              

            const results = await vectorStore.similaritySearchWithScore(vacancyDescription, limit, filter);
            const selectedIds = results.map(([doc]) => doc.metadata.candidateId);
            const selectedIdSet = new Set(selectedIds);
            const now = new Date().toISOString();

            const updatePromises = allCandidates.map(async candidate => {
                try {
                    const isSelected = selectedIdSet.has(candidate.id);
                    const newStatus = isSelected ? ApplicationStatus.IN_REVIEW : ApplicationStatus.DISCARDED;

                    await candidate.docRef.update({
                        status: newStatus,
                        lastProcessedAt: now
                    });

                    if (!isSelected) {
                        try {
                            await this.notificationService.sendRejectionEmail(candidate.email, vacancyData.puesto);
                        } catch (emailError) {
                            console.error(`Failed to send rejection email to ${candidate.email}:`, emailError);
                        }
                    }

                    console.log(`Candidate ${candidate.id} moved to ${newStatus}`);
                } catch (err) {
                    console.error(`Error processing candidate ${candidate.id}:`, err);
                }
            });

            await Promise.all(updatePromises);

            // 7. Generar reporte final
            const successfulCount = batches.filter(r => r.success).length;
            const failureCount = batches.filter(r => !r.success).length;


            this.vacancyService.update(vacancyId, { estado: VacancyStatus.CLOSED }, vacancyData.userId, true);
            return {
                success: true,
                vacancyId,
                totalApplications,
                processedCount: allCandidates.length,
                successfulCount,
                failureCount,
                batches,
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


    private async processBatch(applications: any[], vacancyId: string, vectorStore: any, updateStatus = false) {
        return Promise.all(
            applications.map(async (app) => {
                try {
                    if (!app.cvUrl) {
                        if (updateStatus) {
                            await app.docRef.update({
                                lastProcessedAt: new Date().toISOString(),
                                rejectionReason: "No tiene CV"
                            });
                        }
                        return { id: app.id, success: false, error: "No tiene CV" };
                    }

                    // Extraer texto con timeout
                    const text = await this.extractTextWithTimeout(app.cvUrl, 30000);

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

                    if (updateStatus) {
                        await app.docRef.update({
                            cvProcessed: true,
                            lastProcessedAt: new Date().toISOString()
                        });
                    }

                    return { id: app.id, success: true };

                } catch (error) {
                    if (updateStatus) {
                        await app.docRef.update({
                            processingStatus: "failed",
                            error: error.message.substring(0, 500)
                        });
                    }

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

    async deleteIndex() {
        await this.pineconeService.deleteIndex("cv-index");
        return "eliminado información del index";
    }

    async getVectorStore(vacancyId: string, limit: number) {
        const filter = {
            vacancyId: { $eq: vacancyId }     
        };

        const vacancyDoc = await this.collectionVacancies.doc(vacancyId).get();
            if (!vacancyDoc.exists) {
                throw new Error(`No se encontró la vacante con ID: ${vacancyId}`);
            }

            const vacancyData = vacancyDoc.data();
            const vacancyDescription = `${vacancyData.descripcion || ''}\n\nResponsabilidades:\n${vacancyData.responsabilidades || ''}`;

        const vectorStore = await this.pineconeService.getVectorStore("cv-index");

        const results = await vectorStore.similaritySearchWithScore(vacancyDescription, limit, filter);

        const query = this.collectionApplications
        .where("vacancyId", '==', vacancyId)
        .where("status", "==", ApplicationStatus.RECEIVED)
        ;

        const snapshot = await query.get();

        const allCandidates = snapshot.docs.map(doc => ({
            id: doc.id,
            ...doc.data(),
            docRef: doc.ref
        }));

        const selectedIds = results.map(([doc]) => doc.metadata.candidateId);
        const selectedIdSet = new Set(selectedIds);
        const updatePromises = allCandidates.map(async candidate => {
            try {
                const isSelected = selectedIdSet.has(candidate.id);
                const newStatus = isSelected ? ApplicationStatus.IN_REVIEW : ApplicationStatus.DISCARDED;

                //await candidate.docRef.update({
                //    status: newStatus,
                //    lastProcessedAt: now
                //});
                console.log(`id candidato ${candidate.id} tiene el estado de ${newStatus}`);

                if (!isSelected) {
                    try {
                        //await this.notificationService.sendRejectionEmail(candidate.email, vacancyData.puesto);
                        console.log("fue descartado")
                    } catch (emailError) {
                        console.error(`Failed to send rejection email to ${candidate.email}:`, emailError);
                    }
                }

                console.log(`Candidate ${candidate.id} moved to ${newStatus}`);
            } catch (err) {
                console.error(`Error processing candidate ${candidate.id}:`, err);
            }
        });

        return updatePromises;

    }
    

}