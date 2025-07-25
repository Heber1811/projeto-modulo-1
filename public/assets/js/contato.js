function enviarMensagem(){
    var text = ""

    text += `*Nome Completo:* ${$('#nome').val()}%0a`
    text += `*E-mail:* ${$('#email').val()}%0a`
    text += `*Assunto:* ${$('#assunto').val()}%0a`
    text += `*Mensagem:* ${$('#mensagem').val()}%0a`
    window.location.href = 'https://wa.me/5562999147450?&text=' + text
}