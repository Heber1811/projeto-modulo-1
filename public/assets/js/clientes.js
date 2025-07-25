$(document).ready(function(){
    $("#cep").on('change', function(){
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
    })

    $("#cpf").mask('999.999.999-99')
    $("#celular").mask('(99) 99999-9999')
    $("#cep").mask('99999-999')

    firebase.auth().onAuthStateChanged(function(usuarioLogado){
        if(usuarioLogado){
            $('#navbarDropdownMenuLink').html(usuarioLogado.email)
         buscarClientes()
         $('#load').hide()
        }else{
            location.href='./'
        }
      })
})

function buscarClientes(){
    firebase.firestore().collection("clientes").orderBy("nome").get()
     .then(function(resultado){
         $.each(resultado.docs, function(){
             $('#lista_clientes').append(`
            <tr>
                 <td>${this.data().cpf}</td>)}
                 <td>${this.data().nome}</td>)}
                 <td>${this.data().cidade} - ${this.data().estado}</td>
                 <td>${this.data().celular}<br>${this.data().email}</td>
                 <td>
                 <i class="fas fa-edit" onclick="editarCliente('${this.id}')"></i>
                 </td>
            </tr>
            `)
        })

        $('#tabela_clientes').DataTable({
            "language": {
                "url": "//cdn.datatables.net/plug-ins/1.11.3/i18n/pt_br.json"
            }
        })
 
    })
}



function editarCliente(idCliente){
    firebase.firestore().collection("clientes").doc(idCliente).get()
    .then(function(dadosCliente){
        window.idClienteParaEditar = idCliente
        $("#nome").val(dadosCliente.data().nome)
        $("#cpf").val(dadosCliente.data().cpf)
        $("#data_nascimento").val(dadosCliente.data().data_nascimento)
        $("#celular").val(dadosCliente.data().celular)
        $("#email").val(dadosCliente.data().email)
        $("#cep").val(dadosCliente.data().cep)
        $("#logradouro").val(dadosCliente.data().logradouro)
        $("#numero").val(dadosCliente.data().numero)
        $("#complemento").val(dadosCliente.data().complemento)
        $("#bairro").val(dadosCliente.data().bairro)
        $("#cidade").val(dadosCliente.data().cidade)
        $("#estado").val(dadosCliente.data().estado)
        $("#modal_cadastro").modal('show')

    })
}

 function salvarCliente(){
    var camposObrigatorios = 0
    $('.obrigatorio').each(function(){
        if($(this).val() == ""){
            camposObrigatorios += 1
        }
    })
    if(camposObrigatorios > 0){
        new Swal("Atenção", "Por favor preencha todas os campos com "*" para prosseguir!", "error")
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

gravarCliente(cliente)

}



function gravarCliente(dadosCliente){
    var gravacaoCliente = firebase.firestore().collection("clientes")
    if(window.idClienteParaEditar != null){
        gravacaoCliente.doc(window.idClienteParaEditar)
        .set(dadosCliente, {merge:true}).then(function(){
            gravadoComSucesso()
        })

    }else{
        gravacaoCliente.add(dadosCliente).then(function(){
            gravadoComSucesso()
        })
    }
}

function gravadoComSucesso(){
    new Swal({
            title: "Pronto!",
            icon:"success",
            Text: "Cliente salvo com sucesso.",
            buttonsStyling: false,
            confirmButtonText: "ok! Muito Obrigado.",
            customClass: {
                confirmButton: "btn btn-warning"
            },


    }).then(function(){
        location.reload()
    })
}

function novoCliente(){
    window.idClienteParaEditar = null
    $("#modal_cadastro").find('input').val('')
    $("#modal_cadastro").modal("show")
}