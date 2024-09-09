// /assets/js/bpage.js

$(document).ready(function() {
    let urlx='https://iptv.givethanksgrocers.com/lending/borrower.php';
    var tbnum=0;
    // Load borrowers when the page is ready
    loadBorrowers();

    // Function to add a new borrower
    $('#table-body').on('click', '.add-btn', function() {
        var $row = $(this).closest('tr');
        var borrowerData = {
            name: $row.find('td').eq(1).text().trim(),
            phone: $row.find('td').eq(3).text().trim(),
            address: $row.find('td').eq(2).text().trim()
        };

        if (borrowerData.name && borrowerData.phone && borrowerData.address) {
            $.ajax({
                url: urlx,
                type: 'POST',
                contentType: 'application/json',
                data: JSON.stringify(borrowerData),
                success: function(response) {
                    alert(response.message);
                    console.log('Success:', response);
                    loadBorrowers(); // Refresh the list
                },
                error: function(xhr, status, error) {
                    console.error('Error:', error);
                    alert('Failed to add borrower. Please try again.');
                }
            });
        } else {
            alert('Please fill in all fields.');
        }
    });

    // Function to load borrowers and populate the table
    function loadBorrowers() {
        $.ajax({
            url: urlx,
            type: 'GET',
            success: function(response) {
                var tbody = $('#table-body');
                tbody.empty();
                response.forEach(function(borrower) {
                    tbnum++;
                    tbody.append(
                        `<tr>
                            <td class="d-none">${borrower.BorrowerID}</td>
                             <td>${tbnum}</td>
                            <td class="text-capitalize">${borrower.Name}</td>
                            <td class="text-capitalize">${borrower.Address}</td>
                            <td class="text-capitalize">${borrower.Phone}</td>
                            <td class="text-center">
                                <button class="btn btn-warning btn-sm edit-btn d-none" data-toggle="modal" data-target="#edit-modal" data-id="${borrower.BorrowerID}">Edit</button>
                                <button class="btn btn-danger btn-sm delete-btn" data-id="${borrower.BorrowerID}" style="width: 100%;">Delete</button>
                            </td>
                        </tr>`
                        
                    );
                    
                });
                tbody.append(
                    `<tr>
<td contenteditable="false">${tbnum+1}</td>
<td class="text-capitalize" contenteditable="true"></td>
<td class="text-capitalize" contenteditable="true"></td>
<td contenteditable="true"></td>
<td class="text-center"><button class="btn btn-primary btn-sm add-btn" type="button" style="width: 100%;">Add</button></td>
</tr>`
                );
            },
            error: function(xhr, status, error) {
                console.error('Error:', error);
                alert('Failed to load borrowers. Please try again.');
            }
            
        });
        tbnum=0;
    }

    // Function to edit a borrower
    $('#table-body').on('click', '.edit-btn', function() {
        var id = $(this).data('id');
        $.ajax({
            url: urlx+`?id=${id}`,
            type: 'GET',
            success: function(response) {
                $('#edit-name').val(response.Name);
                $('#edit-phone').val(response.Phone);
                $('#edit-address').val(response.Address);
                $('#update-id').val(response.BorrowerID);
                $('#edit-modal').modal('show');
            },
            error: function(xhr, status, error) {
                console.error('Error:', error);
                alert('Failed to load borrower details. Please try again.');
            }
        });
    });

    $('#update-borrower').on('click', function() {
        var borrowerData = {
            name: $('#edit-name').val().trim(),
            phone: $('#edit-phone').val().trim(),
            address: $('#edit-address').val().trim()
        };
        var id = $('#update-id').val();

        if (borrowerData.name && borrowerData.phone && borrowerData.address) {
            $.ajax({
                url: `/path/to/borrowers.php?id=${id}`,
                type: 'PUT',
                contentType: 'application/json',
                data: JSON.stringify(borrowerData),
                success: function(response) {
                    alert(response.message);
                    $('#edit-modal').modal('hide');
                    loadBorrowers(); // Refresh the list
                },
                error: function(xhr, status, error) {
                    console.error('Error:', error);
                    alert('Failed to update borrower. Please try again.');
                }
            });
        } else {
            alert('Please fill in all fields.');
        }
    });

    // Function to delete a borrower
    $('#table-body').on('click', '.delete-btn', function() {
        var id = $(this).data('id');
        if (confirm('Are you sure you want to delete this borrower?')) {
            $.ajax({
                url:urlx+`?id=${id}`,
                type: 'DELETE',
                success: function(response) {
                    alert(response.message);
                    loadBorrowers(); // Refresh the list
                },
                error: function(xhr, status, error) {
                    console.error('Error:', error);
                    alert('Failed to delete borrower. Please try again.');
                }
            });
        }
    });
});
