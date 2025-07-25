var urlString = window.location.href
var url = new URL(urlString);
var buscarPor = url.searchParams.get("por");
var paginaAtual = url.searchParams.get("pagina");
if(!paginaAtual){
  var paginaAtual = 1
}else{
  paginaAtual = parseInt(paginaAtual)
}


if(buscarPor == "PROMOCAO"){
  $('.nav-item').removeClass('active')
  $('#promocao').addClass('active')

}


function adicionarProdutoNaTela(produto, filtros){
    if(produto.data().foto_destaque){
        var fotoDestaque= produto.data().foto_destaque
    }else{
        var fotoDestaque = "./assets/images/sem_foto.png"
    }
    var palavraChave = (produto.data().nome + produto.data().autor_fabricante)
    .trim()
    .replace(/\s/g,'')
    .toUpperCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g,"")

    
    var precoOriginal = produto.data().preco_venda
    if(produto.data().desconto && produto.data().desconto > 0){
      var precoDesconto = ((precoOriginal / 100) * produto.data().desconto)
      var precoComDesconto = precoOriginal - precoDesconto
      var preco = `
     <span style="font-size: 18px;">
       R$ ${precoComDesconto.toLocaleString('pt-br', {minimumFractionDigits: 2, maximumFractionDigits: 2 })}
       <span  style="margin-left: 10px;  text-decoration: line-through; color: red; font-size:13px">
       R$ ${precoOriginal.toLocaleString('pt-br', {minimumFractionDigits: 2 })}
       </span>
      </span>
      <br>

       `

       var promocao = "PROMOCAO"

    }else{
       var preco = "R$ "+precoOriginal.toLocaleString('pt-br', {minimumFractionDigits: 2 })
      var promocao = ""
    }
      var html = `
    
      <div id="${produto.id}" pesquisar-por="${palavraChave}${promocao}" style="display: none" class="item ${filtros} col-md-4">
      <a href="produto.html?cod=${produto.id}" target="_blank">
        <div class="featured-item text-center">
          <img src="${fotoDestaque}" style="width: auto; max-height:220px">
          <h4>${produto.data().nome.toUpperCase()}</h4>
          <h6 style="width:100%; padding: 10px; text-align:center">${preco}
                  </h6>
                  <button class="btn btn-warning">comprar</button>
        </div>
      </a>
    </div>
    `
         $("#todos_produtos").append(html)
      
  
    }
  


  


function buscarProdutos(){
    firebase.firestore().collection("produtos")
    .where("deletado", "==", false)
    .orderBy("ultima_alteracao", "desc")
    .get()
    .then(function(resultado){
        var maiorValor = 0
        var produtosRecentes = []
        $.each(resultado.docs, function(ind, prod){
          if(prod.data().preco_venda > maiorValor){
            maiorValor = prod.data().preco_venda
           }
           if(ind < 6){
             produtosRecentes.push(prod.id)
           }
        })
        var pontoDeCorte = maiorValor / 2;
        $.each(resultado.docs, function(){
          var filtros = ""
          if(this.data().preco_venda > pontoDeCorte){
            filtros += " alto"
          }else{
            filtros += " baixo"
          }

          if(produtosRecentes.includes(this.id)){
            filtros += " recentes"
          }
          adicionarProdutoNaTela(this, filtros)
        })
        paginarResultados()
        iniciarFiltragem()
     
    }).catch(function(err){
        console.error(err)
    })
}

function paginarResultados(){
  if(buscarPor){

    buscarPor = buscarPor.trim()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g,"")
    .replace(/\s/g,'')
    .toUpperCase()
    adicionarPaginas(`[pesquisar-por*="${buscarPor}"]`)
  }else{
    adicionarPaginas(".item")
  }

}

function mudarDePagina(pagina){
  if(buscarPor){
    location.href =  './busca.html?por='+buscarPor+'&pagina='+pagina
  }else{
    window.location.href = './busca.html?pagina='+pagina
  }
}

function adicionarPaginas(seletor){
  var qtdProdutos = $(seletor).length
  var qtdPaginas = Math.round(qtdProdutos / 6)
  $('#btn_paginas').html('')
  for(i = 1; i <= qtdPaginas; i++){
    $('#btn_paginas').append(`
    <li id="pagina_${i}"><a href="#" onclick="mudarDePagina(${i})">${i}</a></li>
    `)
  }
  $("#pagina_"+paginaAtual).addClass("current-page")

  $(seletor).each(function(indice, produto){
   var indiceProduto = indice + 1
   var indiceInicial = (paginaAtual * 6) - 6
   var indiceFinal = (paginaAtual * 6)
   if( indiceProduto > indiceInicial && indiceProduto <= indiceFinal){
     $(produto).fadeIn()
   }

  })
  if(qtdPaginas == 1){
    $('#btn_paginas').html('')
    if(!buscarPor){ 
      $('.item').fadeIn()
    }
   
  }
}

function iniciarFiltragem(){
      $('#filters').on( 'click', 'button', function() {
        var filterValue = $(this).attr('data-filter');
        buscarPor = null
        $(".item").fadeOut()
        setTimeout(function(){
          adicionarPaginas(filterValue)
        },300)
           
    });
}

function pesquisarProduto(){
  var pesquisaCript = encodeURI($("#campo_pesquisa").val())
  window.location.href = "./busca.html?por="+pesquisaCript
}

$(document).ready(function(){
    buscarProdutos()
})