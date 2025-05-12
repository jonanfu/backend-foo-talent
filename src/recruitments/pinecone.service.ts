import { Injectable } from '@nestjs/common';
import { Pinecone } from '@pinecone-database/pinecone';
import { ConfigService } from '@nestjs/config';
import { PineconeStore } from '@langchain/pinecone';
import { AzureOpenAIEmbeddings } from '@langchain/openai';


@Injectable()
export class PineconeService {
  private pineconeClient: Pinecone;

  constructor(private configService: ConfigService) {
    const apiKey = this.configService.get<string>("PINECONE_API_KEY");
    if (!apiKey) {
      throw new Error("PINECONE_API_KEY is not defined in environment variables");
    }
    this.pineconeClient = new Pinecone({
      apiKey
    });
  }

  async getVectorStore(indexName: string): Promise<PineconeStore> {
    const index = this.pineconeClient.Index(indexName);
  
    const embeddings = new AzureOpenAIEmbeddings({
      azureOpenAIApiKey: this.configService.get("AZURE_OPENAI_API_KEY"),
      azureOpenAIApiInstanceName: this.configService.get("AZURE_OPENAI_API_INSTANCE_NAME"),
      azureOpenAIApiEmbeddingsDeploymentName: this.configService.get("AZURE_OPENAI_API_EMBEDDINGS_DEPLOYMENT_NAME"),
      azureOpenAIApiVersion: this.configService.get("AZURE_OPENAI_API_VERSION"),
      maxRetries: 1,
    });
  
    const vectorStore = await PineconeStore.fromExistingIndex(embeddings, {
      pineconeIndex: index,
    });
  
    return vectorStore;
  }

  async deleteIndex(indexName: string){
    const index = this.pineconeClient.Index(indexName);

    await index.deleteMany({
      deleteAll: true // Borra todo
    });
  }
}