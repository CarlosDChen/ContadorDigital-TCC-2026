
class Categoria {
    constructor(CPFUso, nomeCatego, TipoCatego, DescricaoCatego, ImportanciaCatego) {
        this.CPFUso = CPFUso;
        this.nomeCatego = nomeCatego;
        this.TipoCatego = TipoCatego;
        this.DescricaoCatego = DescricaoCatego;
        this.ImportanciaCatego = ImportanciaCatego;
    }   
    //getter
    getCPFUso() {
        return this.CPFUso;
    }   
    getNomeCatego() {
        return this.nomeCatego;
    }
    getTipoCatego() {
        return this.TipoCatego;
    }
    getDescricaoCatego() {
        return this.DescricaoCatego;
    }
    getImportanciaCatego() {
        return this.ImportanciaCatego;
    }

    //setters
    setCPFUso(CPFUso) {
        this.CPFUso = CPFUso;
    }
    setNomeCatego(nomeCatego) {
        this.nomeCatego = nomeCatego;
    }
    setTipoCatego(TipoCatego) {
        this.TipoCatego = TipoCatego;
    }
    setDescricaoCatego(DescricaoCatego) {
        this.DescricaoCatego = DescricaoCatego;
    }
    setImportanciaCatego(ImportanciaCatego) {
        this.ImportanciaCatego = ImportanciaCatego;
    }
}