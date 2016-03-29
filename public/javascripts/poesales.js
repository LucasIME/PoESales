/**
 * Created by meirellu on 2/28/16.
 */

$(document).ready(function(){
    $('#regButton').on('click', addUser)
})

function addUser(event){
  event.preventDefault();
  var newEntry = {
    'email' : $('input#regemail').val()
  }

  $.ajax({
    type: 'POST',
    data: newEntry,
    url: '/emails/addemail',
    dataType: 'JSON'
  }).done(function(response){
    if (response.msg === ''){
      alert('Data Added Successfuly!')
    }else{
      alert('Error' + response.msg);
    }

  })
}

// function deleteUser(event){
//     event.preventDefault();
//
//     var confirmation = confirm('Are you sure you wanto to delete this user?');
//
//     if (confirmation === true){
//         var email = {
//             'email' : $('input #regemail').val()
//         }
//         $.ajax({
//             type:'DELETE',
//             data : email,
//             url : '/emails/deleteemail/' + $(this).attr('')
//         }).done(function(response){
//             if (response.msg === ''){
//                 alert('Email sucessfully removed!')
//             }else{
//                 alert('Error: ' + response.msg);
//             }
//             //populateTable();
//         })
//     }else{
//         return false;
//     }
// };
