

const button = document.getElementById("botao-cadastro");
const tabelaUltimas = document.getElementById("tabela-ultimas");
let array = [];
let arrayUltima = [];




function cadastrarTransacao()
{
   
    let objeto = {
        valor: document.getElementById("valor").value,
    nome: document.getElementById("nome-transacao").value,
    categoria: document.getElementById("categoria").value,
    tipo: document.getElementById("tipo").value
    }
    



    array.push(objeto);
    const index = array.length-1;
 


    const tabela = document.getElementById("tabela-cadastro");

    const novoCadastro = document.createElement('tr');

    novoCadastro.innerHTML += `<td>${objeto.nome}</td>
                <td>${objeto.categoria}</td>
                <td>R$ ${objeto.valor}</td>
                <td><i class="bi bi-check-square-fill" onclick="addValor(${index})"></i></i></td>
                <td><i class="bi bi-trash3"></i></td>`;
                
    tabela.appendChild(novoCadastro);

    document.getElementById("nome-transacao").value = null;
    document.getElementById("categoria").value = "";
    document.getElementById("valor").value = null;

}

function addValor(index)
{
    
      let objeto = {
        valor: array[index].valor,
    nome: array[index].nome,
    categoria: array[index].categoria,
    tipo: array[index].tipo
    }
    if(arrayUltima.length == 4)
    {
        arrayUltima.pop();
        arrayUltima.unshift(objeto);
    }
    else
    {
    arrayUltima.unshift(objeto);
    }

    
  addUltimas();  

     let saldoNovo;
     
     const valor = array[index].valor;
    
    const saldoEditavel = document.getElementById("saldo");
    
    const saldoFloat = parseFloat(saldoEditavel.innerText);
    console.log(saldoFloat);
    const valorFloat = parseFloat(valor);
    
    
    console.log(saldoNovo);

    if(array[index].tipo == "Despesa")
    {
        saldoNovo = saldoFloat - valorFloat ;
        
    }
    else if(array[index].tipo == "Receita")
    {
        saldoNovo = saldoFloat + valorFloat;
    }

    saldoEditavel.textContent = saldoNovo;
}

function addUltimas()
{

 tabelaUltimas.innerHTML =
           "";
    
    
    

        arrayUltima.forEach(e => {
            
            const ultimaTransacao = document.createElement('tr');
            ultimaTransacao.innerHTML =
            `<tr>
                    <td class="primeiro"><i class="bi bi-fork-knife"></i></td>
                    <td>${e.nome}</td>
                    <td>${e.tipo}</td>
                    <td>${e.valor}</td>
                </tr>`;

            tabelaUltimas.appendChild(ultimaTransacao);
        });

    
}