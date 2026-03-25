    

    // numeros temporarios para ver como fica no site
    const renda = 1000.00;
    const gastos = 750.00;
    const saldo = renda - gastos;
    
    
    
    
    document.getElementById("renda").textContent = "R$ " + renda.toFixed(2);
    document.getElementById("gastos").textContent = "R$ " + gastos.toFixed(2);
    document.getElementById("saldo").textContent = "R$ " + saldo.toFixed(2);

