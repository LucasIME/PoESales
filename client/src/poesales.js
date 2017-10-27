/**
 * Created by meirellu on 2/28/16.
 */
import $ from 'jquery';

$(document).ready(function(){
    //$('#regButton').on('click', addUser);
    //$('#unregButton').on('click', deleteUser);
});

function addUser(event){
  event.preventDefault();

  var newEntry = {
    'email' : $('input#regemail').val()
  };

  $.ajax({
    type: 'POST',
    data: newEntry,
    url: '/emails/addemail',
    dataType: 'JSON'
  }).done(function(response){
    if (response.msg === ''){
      alert('A confirmation email has been sent to you!');
    }else{
      alert('Error' + response.msg);
    }

  });
}

function deleteUser(event){
    event.preventDefault();

    var confirmation = confirm('Are you sure you wanto to delete this user?');

    if (confirmation === true){
        var email = {
            'email' : $('input#unregemail').val()
        };
        console.log(email);
        $.ajax({
            type:'POST',
            data : email,
            url : '/emails/rememail'
        }).done(function(response){
            if (response.msg === ''){
                alert('Unregistration email sent!');
            }else{
                alert('Error: ' + response.msg);
            }
        });
    }else{
        return false;
    }
}
