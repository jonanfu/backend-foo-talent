import { Body, Controller, Param, Post, Query } from "@nestjs/common";
import { RecluitmentService, PreselectionResult } from "./recruitment.service";
import { PreselectionDto } from "./dto/preselection.dto";

@Controller("recruitment")
export class RecluitmentController {

    constructor(private readonly recruitmentService: RecluitmentService) { }

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


    @Post('result_vacancies')
    async preselection(
      @Body() preselectionDto: PreselectionDto,
    ): Promise<PreselectionResult> {
      const { vacancyId, amount } = preselectionDto;
      return await this.recruitmentService.preselection(vacancyId, amount);
    }

    @Post('result_vectorstore')
    async getVectorestore(
      @Body() preselectionDto: PreselectionDto,
    ) {
      const { vacancyId, amount } = preselectionDto;
      return await this.recruitmentService.getVectorStore(vacancyId, amount);
    }

    

    @Post("eliminar-index")
    async eliminarIndex() {
        return await this.recruitmentService.deleteIndex()
    }
}