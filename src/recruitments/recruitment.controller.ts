import { Body, Controller, Param, Post, Query } from "@nestjs/common";
import { RecluitmentService, PreselectionResult } from "./recruitment.service";

@Controller("recruitment")
export class RecluitmentController {

    constructor(private readonly recruitmentService: RecluitmentService) {}

    @Post("save_data")
    async saveData() {
        return this.recruitmentService.saveData();
    }

    @Post("delete")
    async deleteData() {
        return await this.recruitmentService.deleteAll();
    }

    @Post('obtener_data')
    async obtenerData() {
        return this.recruitmentService.getAllProgramadores()
    }

    
    @Post("result_vacancies")
    async preselection(
        @Param('vacancyId') vacancyId: string,
        @Param('amount') amount: number,
    ): Promise<PreselectionResult> {
        return await this.recruitmentService.preselection(vacancyId, amount);
    }

    @Post("eliminar-index")
    async eliminarIndex() {
        return await this.recruitmentService.deleteIndex()
    }
}