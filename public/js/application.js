$(document).ready(function() {
  // $('#profileForm').on('submit', function(e) {
    // e.preventDefault();

    // var formData = $('#profileForm').serialize();
    // $.post('/profile', formData, function(res) {
      // alert(res);
    // });
  // });

  var checkboxes = $('.toppings-item');

  var current = checkboxes.filter(':checked').length 
  if (current >= 3) {
    checkboxes.filter(':not(:checked)').prop('disabled', current >= 3);
  }

  checkboxes.change(function() {
    var current = checkboxes.filter(':checked').length;
    checkboxes.filter(':not(:checked)').prop('disabled', current >= 3);
  });

  /*
  $('#createEvent').on('click', function(e) {
    e.preventDefault();
    // Boo this..
    var csrf = $('input[name="_csrf"]').val();

    $.post('/api/events', '_csrf=' + csrf, function(res) {
      alert(res);
    });
  });
  */
});
