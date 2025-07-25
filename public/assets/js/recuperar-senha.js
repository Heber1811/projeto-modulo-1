function recuperarSenha(){
  var email = $("#navbarDropdownMenuLink").html()
  firebase.auth().sendPasswordResetEmail(email)
  .then(()=>{
     new Swal('Pronto!', 'Um link para alterar sua senha foi enviado para o email '+email,
    'success'
    )
  })
.catch((error) => {
    console.log(error)
    new Swal('Ops!', 'Erro ao enviar link de redefinição para o email  '+email,
    'error'
    )

  });
}