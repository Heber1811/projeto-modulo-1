function validarLogin(){
  $("#load").hide()
    var email = $('#email').val()
    var senha = $('#senha').val()
    if(email ==""){
       new Swal('Atenção', 'Por favor preencha o e-mail para continuar!','error')
        return
    }
    if(senha ==""){
    new Swal('Por favor preencha a senha para continuar!')
        return
    }
    firebase.auth().signInWithEmailAndPassword(email, senha)
  .then((userCredential) => {
    
    
    
    
  })
  .catch((error) => {
   $("#load").hide()
    var errorCode = error.code;
    var errorMessage = error.message;
    if(errorCode == 'auth/wrong-password'){
      new Swal("Ops", "sua senha está inválida. Tente novamente", "error")
    }else if(errorCode =="auth/invalid-email"){
      new Swal("Ops", "Este email está inválido. Tente novamente", "error") 
    }else if(errorCode == 'auth/user-not-found'){
      new Swal("Ops", "Usuário não encontrado. Tente novamente", "error")
    }else{
      new Swal("Ops","Não foi possivel conectar. Tente novamente, se o erro persistir entre em contato com o admnistrador", "error")
    }

  });
    
}

$(document).ready(function(){
  firebase.auth().onAuthStateChanged(function(usuarioLogado){
    if(usuarioLogado){
      location.href= './inicio.html'
    }else{
      $("#load").hide()
    }
  })

})