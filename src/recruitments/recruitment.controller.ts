import { Body, Controller, Param, Post, Query } from "@nestjs/common";
import { RecluitmentService, PreselectionResult } from "./recruitment.service";
import { PreselectionDto } from "./dto/preselection.dto";

@Controller("recruitment")
export class RecluitmentController {

    constructor(private readonly recruitmentService: RecluitmentService) { }

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

}