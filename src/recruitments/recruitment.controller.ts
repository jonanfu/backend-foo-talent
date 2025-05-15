import { Body, Controller, Post, Query } from "@nestjs/common";
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

    
    @Post("result_vacancies")
    async preselection(): Promise<PreselectionResult> {
        return await this.recruitmentService.preselection("OOCRYQhUpOC9wxBMyDM3", 10);
    }

    @Post("eliminar-index")
    async eliminarIndex() {
        return await this.recruitmentService.deleteIndex()
    }
}