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
});
