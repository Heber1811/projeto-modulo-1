window.produtoId = null
$('.mascara_dinheiro').mask('000.000.000.000.000,00', {reverse: true});//framework mask
function buscarProdutos(){
    firebase.firestore()
    .collection('produtos')
    .where("deletado","==",false)
    .get()
    .then(function(produtos){
        $.each(produtos.docs, function(){
            var prod = this
            adicionarProdutosNaTabela(prod)
        })
        $('#tabela_produtos').DataTable({
            "language": {
                "url": "//cdn.datatables.net/plug-ins/1.11.3/i18n/pt_br.json"
            }
        })
    })

  }

  function adicionarProdutosNaTabela(prod){
      $('#lista_produtos').append(`
        <tr>
            <td>${prod.id}</td>
            <td>${prod.data().nome}</td>
            <td>${prod.data().preco_venda.toLocaleString('pt-br', {minimumFractionDigits:2})}</td>
            <td>${prod.data().preco_compra.toLocaleString('pt-br', {minimumFractionDigits:2})}</td>
            <td>
                <i onclick="editarProduto('${prod.id}')" class="fas fa-edit"></i>
                <i onclick="excluirProduto('${prod.id}')"style="margin:10px;" class="fas fa-trash"></i>
            </td>
        </tr>
      `)
  }

function novoProduto(){
    $(".btn_apaga_foto").parent().find('input').val('')
    $(".btn_apaga_foto").parent().find('img').attr('src', '../assets/images/sem_foto.png')
    $("#modal_produto").modal("show")
    $('#modal_produto').find("input").val('')
    $('#modal_produto').find("textarea").val('')
    window.produtoId = null
}

function salvarProduto(){
    if($('#produto_nome').val() == ""){
        new Swal("Atenção",'por favor preencha o campo "Nome Produto" para proseguir!', "error")
        return
    }
    if($('#produto_autor_fabricante').val() == ""){
        new Swal("Atenção",'por favor preencha o campo "Autor/Fabricante', "error")
        return
    }
    if($('#produto_categorias').val() == ""){
        new Swal("Atenção",'por favor preencha o campo "Categoria', "error")
        return
    }
    if($('#produto_url').val() == ""){
        new Swal("Atenção",'por favor preencha o campo "URL Pagamento', "error")
        return
    }

    if($('#produto_preco_venda').val() == ""){
        new Swal("Atenção",'por favor preencha o campo "Preço Venda" para proseguir!', "error")
        return
    }
    if($('#produto_preco_compra').val() == ""){
        new Swal("Atenção",'por favor preencha o campo "Preço Compra" para proseguir!', "error")
        return
    }

    if($('#produto_desconto').val() == ""){
        new Swal("Atenção",'por favor preencha o campo "Desconto" para proseguir!', "error")
        return
    }

    if(window.produtoId == null && $('#produto_foto_destaque').val() == ""){
        new Swal("Atenção",'por favor preencha o campo "Foto/Banner destaque" para proseguir!', "error")
        return
    }
    var precoVenda = $('#produto_preco_venda').val().replace(/\./g,'').replace(',','.')
    var precoCompra = $('#produto_preco_compra').val().replace(/\./g,'').replace(',','.')
var objProduto = {       
nome: $('#produto_nome').val(),
autor_fabricante:$('#produto_autor_fabricante').val(),
url_pagamento:$('#produto_url').val(),
descricao:$('#produto_descricao').val(),
categorias:$('#produto_categorias').val().split(";"),
preco_venda: parseFloat(precoVenda),
preco_compra: parseFloat(precoCompra),
desconto:parseInt($('#produto_desconto').val()),
qtd_estoque:$('#produto_qtd_estoque').val(),
deletado: false,
ultima_alteracao: new Date()
    }
    var listaFotos = []

    $('[type="file"]').each(function(){
        if($(this).val() !=""){
            listaFotos.push($(this).attr('id'))
        }else{
            if($(this).parent().find('img').attr('src') == '../assets/images/remover_foto.png'){
                var caminhoFoto = $(this).attr('id').replace('produto_', '')
                objProduto[caminhoFoto] = null
            }
        }

    })
     if(listaFotos.length > 0){
         gravaFotoRecursiva(objProduto, listaFotos, 0)
     }else{
         gravarProduto(objProduto)
     }
    
}

function removerFoto(elemento){
    $(elemento).parent().find('img').attr('src', '../assets/images/remover_foto.png')
    $(elemento).parent().find('input').val('')
}

function gravaFotoRecursiva(objProduto, listaFotos, indiceFoto){
    $("#load").show()
    $("#modal_produto").modal("hide")
    var minhaFoto = $("#"+listaFotos[indiceFoto]).parent().find('img').attr('src')
    var nomeFoto = document.getElementById(listaFotos[indiceFoto]).files[0].name
    var horaAtual = new Date().getTime
    nomeFoto = horaAtual + nomeFoto
    var servicoStorage = firebase.storage().ref()
    .child("fotos_produtos/"+nomeFoto)

    
  
    servicoStorage.putString(minhaFoto, 'data_url').then(function(){
        servicoStorage.getDownloadURL().then(function(urlFoto){
            var caminhoFoto = listaFotos[indiceFoto].replace('produto_', '')
            objProduto[caminhoFoto] = urlFoto
            if(indiceFoto < (listaFotos.length - 1 )){
                gravaFotoRecursiva(objProduto, listaFotos, (indiceFoto + 1))
            }else{
                gravarProduto(objProduto) 
            }
           
        });
    }
 
   
)

}

function gravarProduto(objProduto){
    $("#load").hide()
    if(window.produtoId != null){
        firebase.firestore()
        .collection("produtos")
        .doc(window.produtoId)
        .set(objProduto, {merge: true})
        .then(function(resultado){
            new Swal({
                title: "Pronto!",
                icon:"success",
                Text: "Produto salvo com sucesso.",
                buttonsStyling: false,
                customClass: {
                    confirmButton: "btn btn-warning"
                },
    
                         
            }).then(function(){
                location.reload()
            })
        })
    }else{
        objProduto.cadastrado_em = new Date()
        firebase.firestore().collection("produtos").add(objProduto).then(function(resultado){
            new Swal({
                title: "Pronto!",
                icon:"success",
                Text: "Produto cadastrado com sucesso..",
                buttonsStyling: false,
                customClass: {
                    confirmButton: "btn btn-warning"
                },
                           
            }).then(function(){
                location.reload()
            })
        })
    }
}

function editarProduto(idProduto){
    window.produtoId = idProduto
    firebase.firestore()
    .collection('produtos')
    .doc(idProduto)
    .get()
    .then(function(produto){
        if(produto.data().categorias){
            var categ = produto.data().categorias.join(';')
        }else{
            var categ = ""
        }
        $('.carregar_imagem').attr('src', '../assets/images/sem_foto.png')
        if(produto.data().foto_destaque){
            $("#produto_foto_destaque").parent().find('img').attr('src', produto.data().foto_destaque)
        }
        if(produto.data().foto_1){
            $("#produto_foto_1").parent().find('img').attr('src', produto.data().foto_1)
        }
        if(produto.data().foto_2){
            $("#produto_foto_2").parent().find('img').attr('src', produto.data().foto_2)
        }
        if(produto.data().foto_3){
            $("#produto_foto_3").parent().find('img').attr('src', produto.data().foto_3)
        }
        if(produto.data().foto_4){
            $("#produto_foto_4").parent().find('img').attr('src', produto.data().foto_4)
        }
        if(produto.data().foto_5){
            $("#produto_foto_5").parent().find('img').attr('src', produto.data().foto_5)
        }
       
        $("#produto_nome").val(produto.data().nome)
        $("#produto_autor_fabricante").val(produto.data().autor_fabricante)
        $("#produto_descricao").val(produto.data().descricao)
        $("#produto_categorias").val(categ)
        $("#produto_url").val(produto.data().url_pagamento)
        $("#produto_preco_venda").val(produto.data().preco_venda.toLocaleString('pt-br', {minimumFractionDigits:2}))
        $("#produto_preco_compra").val(produto.data().preco_compra.toLocaleString('pt-br', {minimumFractionDigits:2}))
        $("#produto_desconto").val(produto.data().desconto)
        $("#produto_qtd_estoque").val(produto.data().qtd_estoque)
        $("#modal_produto").modal('show')
    })

}

function excluirProduto(idProduto){
    Swal.fire({
        title: "Atenção",
        text: 'Realmente deseja excluir este produto?',
        icon: "question",
        showCancelButton: true,
        confirmButtonText: "Sim, desejo remover.",
        cancelButtonText: "Cancelar!",
        reverseButtons: true


        


    }).then(function(result){
        if(result.value){
            var objProduto = {
                deletado: true
            }
            firebase.firestore()
            .collection("produtos")
            .doc(idProduto)
            .set(objProduto, {merge:true})
            .then(function(resultado){
                new Swal({
                    title: "Pronto!",
                    icon: "success",
                    text: "Produto deletado com sucesso."
                }).then(function(){
                    location.reload()
                })
            })
        }
    });
}

$(document).ready(function(){
    firebase.auth().onAuthStateChanged(function(usuarioLogado){
      //nesse caso, (usuarioLogado) é o mesmo que (usuarioLogado != null)
      if(usuarioLogado){
          $('#navbarDropdownMenuLink').html(usuarioLogado.email)
       buscarProdutos()
       $('#load').hide()
      }else{
          location.href='./'
      }
    })
    
    $('[type="file"]').on('change',function(){
        if($(this).val() !=""){
            var idImagem = $(this).attr('id')
            var leitorDeArquivo = new FileReader()
            var imagem = document.getElementById(idImagem).files[0]
            leitorDeArquivo.onloadend = function(){
                $("#"+idImagem).parent().find('img').attr('src', leitorDeArquivo.result)
            }
            leitorDeArquivo.readAsDataURL(imagem)
        }
    })
  })