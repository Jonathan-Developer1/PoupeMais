
import { filtromes, filtroano } from "./home.js";

//imprimir a nova transação
export async function cadastrarTransacao(objeto) {

  const tabela = document.getElementById("tabela-cadastro");

  if(tabela)
  tabela.innerHTML = ""; // limpa antes

  
  objeto.forEach(e => {
    const novoCadastro = document.createElement('tr');
    
    const data = new Date(e.data);
    
    const valor = e.valor;
            const valorAtualizado = valor.toLocaleString('pt-BR', {
                  style: 'currency',
                  currency: 'BRL',
                          });
                          
    if(filtromes && filtroano)
    {
    if(filtromes.value == data.getMonth() && filtroano.value == data.getFullYear())
    {
    if(e.confirmada)
    {
      novoCadastro.innerHTML += `<td>${e.nome}</td>
                <td>${data.toLocaleString('pt-BR', { timezone: 'UTC', dateStyle: 'short' })}</td>
                <td>${e.categoria}</td>
                <td>${valorAtualizado}</td>
                <td>${e.parcelas}</td>
                <td style="cursor: pointer"><i class="bi bi-x-square-fill" onclick="desfazerTransacao(${e.id_transacao})"></i></td>
                <td style="cursor: pointer"><i class="bi bi-trash3" onclick="excluirTransacao(${e.id_transacao}, ${e.id_parcela})"></i></td>`;
    }
    else
    {
    novoCadastro.innerHTML += `<td>${e.nome}</td>
                <td>${data.toLocaleString('pt-BR', { timezone: 'UTC', dateStyle: 'short' })}</td>
                <td>${e.categoria}</td>
                <td>${valorAtualizado}</td>
                <td>${e.parcelas}</td>
                <td style="cursor: pointer"><i class="bi bi-check-square-fill" onclick="confirmarTransacao(${e.id_transacao})"></i></td>
                <td style="cursor: pointer"><i class="bi bi-trash3" onclick="excluirTransacao(${e.id_transacao})"></i></td>`;
    }
    
    tabela.appendChild(novoCadastro);
  }
}
  });
}

export async function addUltimas(objeto)
{

  let tabelaUltimas = document.getElementById("tabela-ultimas");
    
if(tabelaUltimas)
  tabelaUltimas.innerHTML = "";
  
        objeto.forEach(e => {
             const tipo = e.tipo;
            const tipoMaiusculo = tipo.charAt(0).toUpperCase() + tipo.slice(1);
            const valor = e.valor;
            const valorAtualizado = valor.toLocaleString('pt-BR', {
                  style: 'currency',
                  currency: 'BRL',
                          });
            const ultimaTransacao = document.createElement('tr');
            ultimaTransacao.innerHTML =
            `<tr>
                    <td class="primeiro"><i class="bi bi-coin"></i></td>
                    <td>${e.nome}</td>
                    <td>${tipoMaiusculo}</td>
                    <td>${valorAtualizado}</td>
                </tr>`;

            tabelaUltimas.appendChild(ultimaTransacao);
        });

    
}