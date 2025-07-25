$(document).ready(function(){
    $("#nome").select2({
        dropdownParent: $('#modal_venda')
    });
    $("#produto_nome").select2({
        dropdownParent: $('#modal_venda')
    });

    $(".nav_tab").on('click', function(){
        $(".nav_tab").removeClass('active')
        $(this).addClass("active")
        $('.row_tab').hide()
        var idRow = $(this).attr("href")
        $(idRow).show()
    })

    var dh = new Date()
    dh.setDate(dh.getDate() -2)
    var dia = dh.getDate().toString().padStart(2, '0')
    var dataIni = `${dh.getFullYear()}-${dh.getMonth() + 1}-${dia}`
  
    dh.setDate(dh.getDate() + 4)
    var dia = dh.getDate().toString().padStart(2, '0')
    var dataFim = `${dh.getFullYear()}-${dh.getMonth() + 1}-${dia}` 
    $("#data_inicial").val(dataIni)
    $("#data_final").val(dataFim)

    firebase.auth().onAuthStateChanged(function(usuarioLogado){
        if(usuarioLogado){
            $('#navbarDropdownMenuLink').html(usuarioLogado.email)
         buscarVendas()
         $('#load').hide()
        }else{
            location.href='./'
        }
      })
})



  function buscarVendas(){
      var dataIni = $("#data_inicial").val()
      dataIni = new Date(dataIni)

      var dataFim = $("#data_final").val()
      dataFim = new Date(dataFim)

     firebase.firestore().collection("vendas")
     .where("data_venda", ">", dataIni)
     .where("data_venda", "<", dataFim)
     .get().then(function(vendas){
         if(window.tabelaVendas){
             window.tabelaVendas.destroy()
         }
         $("#lista_vendas").html('')
         var precoVenda = 0
         var precoCompra = 0
         $.each(vendas.docs, function(){
            precoVenda +=  this.data().produto.preco_venda
            precoCompra +=  this.data().produto.preco_compra
             var dv = this.data().data_venda.toDate()
             dv = ` ${dv.getDate()}/${dv.getMonth() + 1}/${dv.getFullYear()} - ${dv.getHours()}:${dv.getMinutes()}`
             var situacao = (this.data().situacao ? this.data().situacao : "Aguardando Confirmação")
             $("#lista_vendas").append(`
             <tr>
             <td>${this.id}<br><b style="white-space: nowrap">${situacao}</b></td>
             <td>${dv}</td>
             <td>${this.data().comprador.nome}<br><b style="color:#f27649">${this.data().produto.nome}</b></td>
             <td>R$ ${this.data().produto.preco_venda.toLocaleString('pt-br', {minimumFractionDigits: 2})}</td>
             <td><i style="cursor:pointer" onclick="verVenda('${this.id}')" class="fas fa-eye"></i></td>
             </tr>
             `)
         })
         var precoLucro = precoVenda - precoCompra
         $("#total_vendido").html(precoVenda.toLocaleString('pt-br', {minimumFractionDigits:2}))
         $("#total_lucro").html(precoLucro.toLocaleString('pt-br', {minimumFractionDigits:2}))

         window.tabelaVendas = $("#tabela_vendas").DataTable({
             "language": {
                "url": "//cdn.datatables.net/plug-ins/1.11.3/i18n/pt_br.json"
             }
         })
     })

  }


  function verVenda(idVenda){
      $("#modal_venda").find('input').val('')
      $("#nome").html('')
      $("#produto_nome").html('')
      firebase.firestore().collection("vendas")
      .doc(idVenda).get().then(function(venda){
          window.idVendaAtual = idVenda
          if(venda.data().situacao){
             $("#venda_situacao").val(venda.data().situacao)
          }

          var nome = venda.data().comprador.nome
          $("#nome").append(`<option value="${nome}">${nome}</option>`)
          $("#nome").val()
  
        $("#cpf").val(venda.data().comprador.cpf)
        $("#data_nascimento").val(venda.data().comprador.data_nascimento)
        $("#celular").val(venda.data().comprador.celular)
        $("#email").val(venda.data().comprador.email)
        $("#cep").val(venda.data().comprador.cep)
        $("#logradouro").val(venda.data().comprador.logradouro)
        $("#numero").val(venda.data().comprador.numero)
        $("#complemento").val(venda.data().comprador.complemento)
        $("#bairro").val(venda.data().comprador.bairro)
        $("#cidade").val(venda.data().comprador.cidade)
        $("#estado").val(venda.data().comprador.estado)
        $("#produto_preco_venda").val(venda.data().produto.preco_venda)
        $("#produto_desconto").val(venda.data().produto.desconto)
        $("#produto_autor_fabricante").val(venda.data().produto.autor_fabricante)
        var produtoNome = venda.data().produto.nome
        $("#produto_nome").append(`<option value="${produtoNome}">${produtoNome}</option>`)
        $("#produto_nome").val()

        $("#modal_venda").find('input').prop('disabled', true)
        $("#modal_venda").modal('show')
      })


      
  }


  function salvarVenda(){
    var venda = {}
    venda.ultima_alteracao = new Date()
    venda.situacao = $("#venda_situacao").val()
    if(!window.idVendaAtual){
   
    venda.produto = {}
    venda.comprador = {}
    venda.comprador.nome = $("#nome").find('option:selected').text()
    venda.comprador.cpf = $("#cpf").val()
    venda.comprador.data_nascimento = $("#data_nascimento ").val()  
    venda.comprador.celular = $("#celular").val()
    venda.comprador.email = $("#email").val()
    venda.comprador.cep = $("#cep").val()
    venda.comprador.logradouro = $("#logradouro").val()
    venda.comprador.numero = $("#numero").val()
    venda.comprador.complemento = $("#complemento").val()
    venda.comprador.bairro = $("#bairro").val()
    venda.comprador.cidade = $("#cidade").val()
    venda.comprador.estado = $("#estado").val()
    venda.produto.nome = $("#produto_nome").find('option:selected').text()
    var valorVenda = $("#produto_preco_venda").val().replace(/\./g,'').replace(',' , '.')
    venda.produto.preco_venda = parseFloat(valorVenda)
    var precoCompra = window.produtosVendas[$('#produto_nome').val()].preco_compra
    venda.produto.preco_compra = parseFloat(precoCompra)
    venda.produto.desconto = parseInt($("#produto_desconto").val())
    venda.produto.autor_fabricante = $("#produto_autor_fabricante").val()

    }
    var gravacaoVenda =  firebase.firestore().collection("vendas")

    if(window.idVendaAtual){
        gravacaoVenda.doc(window.idVendaAtual).set(venda, {merge: true})
        .then(function(){
            vendaGravadaComSucesso()
        })
    }else{
        venda.data_venda = new Date()
        gravacaoVenda.add(venda)
        .then(function(){
            vendaGravadaComSucesso()
        })
    }
    
  }

  function vendaGravadaComSucesso(){
      new Swal({
          title: "Pronto!",
          icon: "success",
          text: "Venda salva com sucesso"
      }).then(function(){
          location.reload()
      })
    }


    function novaVenda(){
        $("#nome").select2('destroy');
        $("#produto_nome").select2('destroy');    
        $("#modal_venda").find('input').val('')
        $("#nome").html('<option value="">Selecionar</option>')
        $("#nome").on('change', function(){selecionarCliente() })
        $("#produto_nome").html('<option value="">Selecionar</option>')
        $("#produto_nome").on('change', function(){selecionarProduto() })
        window.idVendaAtual = null
        firebase.firestore().collection("clientes").get()
        .then(function(cli){
            window.clientesVendas = {}
            $.each(cli.docs, function(){
                window.clientesVendas[this.id] = this.data()
                $("#nome").append(`<option value="${this.id}">${this.data().nome} - ${this.data().cpf}</option>`)

            })
        })

        firebase.firestore().collection("produtos").where("deletado", "==", false).get()
        .then(function(pro){
            window.produtosVendas = {}
            $.each(pro.docs, function(){
                window.produtosVendas[this.id]= this.data()
                $("#produto_nome").append(`<option value="${this.id}">${this.data().nome}</option>`)

            })

        })

         $("#nome").select2({
        dropdownParent: $('#modal_venda')
        });
         $("#produto_nome").select2({
        dropdownParent: $('#modal_venda')
    });
        $("#modal_venda").modal("show")
    }

    function selecionarCliente(){
       var comprador = window.clientesVendas[$("#nome").val()]
       $("#cpf").val(comprador.cpf).prop('disabled', true)
       $("#data_nascimento").val(comprador.data_nascimento).prop('disabled', true)
       $("#celular").val(comprador.celular).prop('disabled', true)
       $("#email").val(comprador.email).prop('disabled', true)
       $("#cep").val(comprador.cep).prop('disabled', true)
       $("#logradouro").val(comprador.logradouro).prop('disabled', true)
       $("#numero").val(comprador.numero).prop('disabled', true)
       $("#complemento").val(comprador.complemento).prop('disabled', true)
       $("#bairro").val(comprador.bairro).prop('disabled', true)
       $("#cidade").val(comprador.cidade).prop('disabled', true)
       $("#estado").val(comprador.estado).prop('disabled', true)

    }

    function selecionarProduto(){
        var produto = window.produtosVendas[$("#produto_nome").val()]
        $("#produto_preco_venda").val(produto.preco_venda.toLocaleString('pt-br', {minimumFractionDigits: 2})).prop('disabled', true)
        $("#produto_desconto").val(produto.desconto).prop('disabled', true)
        $("#produto_autor_fabricante").val(produto.autor_fabricante).prop('disabled', true)
    }
