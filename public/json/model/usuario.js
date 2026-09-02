class Usuario {
   constructor(CPFuso, email, tell, NomeUso, NomeFanUso, SenhaUso) {
    this.CPFuso = CPFuso;
    this.email = email;
    this.tell = tell;
    this.NomeUso = NomeUso;
    this.NomeFanUso = NomeFanUso;
    this.SenhaUso = SenhaUso;
   }
    //getters
    getCPFuso() {
        return this.CPFuso;
    }   
    getEmail() {
        return this.email;
    }           
    getTell() {
        return this.tell;
    }     
    getNomeUso() {
        return this.NomeUso;
    }   
    getNomeFanUso() {
        return this.NomeFanUso;
    }
    getSenhaUso() {
        return this.SenhaUso;
    }

    //setters
    setCPFuso(CPFuso) {
        this.CPFuso = CPFuso;
    }       
    setEmail(email) {
        this.email = email;
    }               
    setTell(tell) {
        this.tell = tell;
    }
    setNomeUso(NomeUso) {
        this.NomeUso = NomeUso;
    }
    setNomeFanUso(NomeFanUso) {
        this.NomeFanUso = NomeFanUso;
    }       
    setSenhaUso(SenhaUso) {
        this.SenhaUso = SenhaUso;
    }


}