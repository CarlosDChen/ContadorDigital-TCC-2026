class valores {
    constructor(CPFuso, nomeValor, Valorvalor, RecorValor, RescDespes, DataEntra, DiscricaoValor) {
        this.CPFuso = CPFuso;
        this.nomeValor = nomeValor;
        this.Valorvalor = Valorvalor;
        this.RecorValor = RecorValor;
        this.RescDespes = RescDespes;
        this.DataEntra = DataEntra;
        this.DiscricaoValor = DiscricaoValor;
    }

    //getters
    getCPFuso() {
        return this.CPFuso;
    }          
    getNomeValor() {
        return this.nomeValor;
    }
    getValorvalor() {
        return this.Valorvalor;
    }
    getRecorValor() {
        return this.RecorValor;
    }   
    getRescDespes() {
        return this.RescDespes;
    }
    getDataEntra() {
        return this.DataEntra;
    }
    getDiscricaoValor() {
        return this.DiscricaoValor;
    }      

    //setters
    setCPFuso(CPFuso) {
        this.CPFuso = CPFuso;
    }               
    setNomeValor(nomeValor) {
        this.nomeValor = nomeValor;
    }
    setValorvalor(Valorvalor) {
        this.Valorvalor = Valorvalor;
    }   
    setRecorValor(RecorValor) {
        this.RecorValor = RecorValor;
    }   
    setRescDespes(RescDespes) {
        this.RescDespes = RescDespes;
    }
    setDataEntra(DataEntra) {
        this.DataEntra = DataEntra;
    }
    setDiscricaoValor(DiscricaoValor) {
        this.DiscricaoValor = DiscricaoValor;
    }

    
}