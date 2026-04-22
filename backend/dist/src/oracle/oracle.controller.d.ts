import { OracleService } from './oracle.service';
export declare class OracleController {
    private readonly oracleService;
    constructor(oracleService: OracleService);
    generateConcept(body: {
        prompt: string;
        context?: any;
        history?: any[];
    }, user: any): Promise<any>;
}
