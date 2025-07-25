$(document).ready(function(){
    $("#celular").mask('(99) 99999-9999')
    $("#cep").mask('99999-999')
    $("#cpf").mask('999.999.999-99')





    var urlString = window.location.href
    var url = new URL(urlString);
    var idProduto = url.searchParams.get("cod");
    firebase.firestore().collection("produtos").doc(idProduto).get().then(function(resultado){
        if(resultado.exists){
            
            if(resultado.data().foto_destaque){
                $("#slider").find('ul').append(`<li><img src="${resultado.data().foto_destaque}"</li>`)
                $("#carousel").find('ul').append(`<li><img src="${resultado.data().foto_destaque}"</li>`)
            }
            if(resultado.data().foto_1){
                $("#slider").find('ul').append(`<li><img src="${resultado.data().foto_1}"</li>`)
                $("#carousel").find('ul').append(`<li><img src="${resultado.data().foto_1}"</li>`)
            }
            if(resultado.data().foto_2){
                $("#slider").find('ul').append(`<li><img src="${resultado.data().foto_2}"</li>`)
                $("#carousel").find('ul').append(`<li><img src="${resultado.data().foto_2}"</li>`)
            }
            if(resultado.data().foto_3){
                $("#slider").find('ul').append(`<li><img src="${resultado.data().foto_3}"</li>`)
                $("#carousel").find('ul').append(`<li><img src="${resultado.data().foto_3}"</li>`)
            }
            if(resultado.data().foto_4){
                $("#slider").find('ul').append(`<li><img src="${resultado.data().foto_4}"</li>`)
                $("#carousel").find('ul').append(`<li><img src="${resultado.data().foto_4}"</li>`)
            }
            if(resultado.data().foto_5){
                $("#slider").find('ul').append(`<li><img src="${resultado.data().foto_5}"</li>`)
                $("#carousel").find('ul').append(`<li><img src="${resultado.data().foto_5}"</li>`)
            }




            carregarSliderCarousel()

            var precoOriginal = resultado.data().preco_venda
            if(resultado.data().desconto && resultado.data().desconto > 0){
              var precoDesconto = ((precoOriginal / 100) * resultado.data().desconto)
              var precoComDesconto = precoOriginal - precoDesconto
              var preco = `
             <span style="font-size: 18px;">
               R$ ${precoComDesconto.toLocaleString('pt-br', {minimumFractionDigits: 2, maximumFractionDigits: 2})}
               <span  style="margin-left: 10px;  text-decoration: line-through; color: red; font-size:13px">
               R$ ${precoOriginal.toLocaleString('pt-br', {minimumFractionDigits: 2 })}
               </span>
              </span>
              <br>
        
               `
        
             
        
            }else{
               var preco = "R$" +precoOriginal.toLocaleString('pt-br', {minimumFractionDigits: 2 })
              
            }
           
            $("#nome_produto").html(resultado.data().nome)
            $("#autor_produto").html(resultado.data().autor_fabricante)
            $("#preco_produto").html(preco)
            $("#descr_produto").html(resultado.data().descricao)
            $("#qtd_produto").html(resultado.data().qtd_estoque + " Em estoque")
            if(resultado.data().categorias){
                var categ = resultado.data().categorias.join(", ")
            }else{
                var categ = ""
            }
            $("#categorias_produto").append(categ)
            window.produtoSelecionado = resultado
        }else{
            alert("Produto não encontrado")
            location.href = './'
        }
    })
})


function fecharVenda(){
    $('#modal_cadastro').modal('show')
}

function buscarCEP(){
    var cep = $("#cep").val().replace('-', '')
    var urlApiTerceiro =  "https://viacep.com.br/ws/" + cep + "/json/?callback="
    $.getJSON(urlApiTerceiro, function(resultado){
        if(!("erro" in resultado)){
            $('#logradouro').val(resultado.logradouro).prop('disabled', true);
            $('#bairro').val(resultado.bairro).prop('disabled', true);
            $('#cidade').val(resultado.localidade).prop('disabled', true);
            $('#estado').val(resultado.uf).prop('disabled', true);
          
        }else{
            new Swal("OPS!", "Não foi  possível buscar este CEP, verifique-o e tente novamente.")
        }
    })
}


function finalizarCompra(){
    var camposObrigatorios = 0
    $('.obrigatorio').each(function(){
        if($(this).val() == ""){
            camposObrigatorios += 1
        }
    })
    
    if(camposObrigatorios > 0){
        new Swal("Atenção", 'Por favor preencha todos os campos com "*" para prosseguir!', "error")
        return
    }

    var cliente = {
        nome :  $("#nome").val(),
        cpf : $("#cpf").val(),
        data_nascimento : $("#data_nascimento").val(),
        celular : $("#celular").val(),
        email : $("#email").val(),
        cep : $("#cep").val(),
        logradouro : $("#logradouro").val(),
        numero : $("#numero").val(),
        complemento : $("#complemento").val(),
        bairro : $("#bairro").val(),
        cidade : $("#cidade").val(),
        estado : $("#estado").val()


    }

    var venda = {
        produto: window.produtoSelecionado.data(),
        comprador:cliente,
        data_venda: new Date()
    }


    venda.produto.id = window.produtoSelecionado.id

    firebase.firestore().collection("clientes").doc(cliente.cpf).set(cliente, {merge:true})
    .then(function(){
        gravarVenda(venda)
    })
    
}

function gravarVenda(venda){
    firebase.firestore().collection("vendas").add(venda)
    .then(function(resultado){
        new Swal ({
            title: "Pronto!",
            icon:"success",
            confirmButtonText: "Realizar Pagamento",
            html: `Seu pedido foi gerado com o seguinte código: <br>
            <b>${resultado.id}</b></br>
            clique no botão abaixo 'Realizar Pagamento ' para prosseguir com o pagamento`
        }).then(function(){
            $('#modal_cadastro').modal('hide')
            window.open(venda.produto.url_pagamento)
        })
    })
}