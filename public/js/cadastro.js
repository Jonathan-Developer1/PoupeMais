

const button = document.getElementById("botao-cadastro");
const tabelaUltimas = document.getElementById("tabela-ultimas");
let array = [];
let arrayUltima = [];




export async function cadastrarTransacao(objeto) {

  const tabela = document.getElementById("tabela-cadastro");

  tabela.innerHTML = ""; // limpa antes

  objeto.forEach(e => {
    const novoCadastro = document.createElement('tr');

    novoCadastro.innerHTML = `
      <td>${e.nome}</td>
      <td>${e.data ?? "-"}</td>
      <td>${e.categoria}</td>
      <td>R$ ${e.valor}</td>
      <td><i class="bi bi-check-square-fill"></i></td>
      <td><i class="bi bi-trash3"></i></td>
    `;

    tabela.appendChild(novoCadastro);
  });
}



export async function addValor(index)
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

export async function addUltimas()
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