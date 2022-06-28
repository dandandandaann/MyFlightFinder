import type { Program } from "./util";

export default abstract class LoyaltyProgram {

    constructor(
        public program: Program, 
        public origin: string, 
        public destination: string, 
        public month: number, 
        public year: number) {
    }

    public abstract dailyFareUrl(urlDate): string;
    protected abstract monthlyFaresUrl(): string;

}