import { Injectable } from '@nestjs/common';
import { promises as fs } from 'fs';
import * as path from 'path';
import { compile } from 'handlebars'; // o cualquier otro motor de plantillas

@Injectable()
export class TemplateService {
  private readonly templatesDir = path.join('src/notifications/templates');

  async renderTemplate(templateName: string, context: object): Promise<string> {
    try {
      // Leer el archivo de plantilla
      const templatePath = path.join(this.templatesDir, `${templateName}.html`);
      const templateContent = await fs.readFile(templatePath, 'utf8');
      
      // Compilar la plantilla (usando Handlebars en este ejemplo)
      const template = compile(templateContent);
      return template(context);
    } catch (error) {
      throw new Error(`Error rendering template: ${error.message}`);
    }
  }
}