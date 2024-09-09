$(document).ready(function () {
    // Function to handle the "Add" button click event
    let urlx = 'https://iptv.givethanksgrocers.com/lending/cashflow.php';
    var tbnum = 0;

    loadcashflow();

    function formatPrice(price) {
        return price
            .toString()
            .replace(/\B(?=(\d{3})+(?!\d))/g, ",");
    }

    $('#table-body').on('click', '.add-btn', function () {
        // Fetch the input values
        let cashFlowData = {
            date: $('#cashflow-date').val(),
            type: $('#cashflow-type').val(),
            amount: parseFloat($('#cashflow-amount').text()),
            description: $('#cashflow-description').text()
        };

        // Validate inputs
        if (!cashFlowData.date || isNaN(cashFlowData.amount) || cashFlowData.amount <= 0) {
            alert('Please provide valid inputs');
            return;
        }

        // Make an AJAX request to the cashflow API
        $.ajax({
            url: urlx, // Update with the correct path to your API
            type: 'POST',
            data: JSON.stringify(cashFlowData),
            contentType: 'application/json',
            success: function (response) {
                var tbody = $('#table-body');
                alert('Cash flow entry added successfully');
                // Dynamically append the new row to the table
                loadcashflow();
            },
            error: function (xhr, status, error) {
                alert('Error: ' + xhr.responseJSON.message);
            }
        });
    });

    function loadcashflow() {
        $.ajax({
            url: urlx,
            type: 'GET',
            success: function (response) {
                var tbody = $('#table-body');
                tbody.empty();
                response.forEach(function (cashFlow) {
                    tbnum++;
                    tbody.append(
                        `
                        <tr>
                            <td>${tbnum}</td>
                            <td>${cashFlow.Date}</td>
                            <td>${cashFlow.Type}</td>
                            <td>₱${formatPrice(cashFlow.Amount)}</td>
                            <td class="text-center text-capitalize">${cashFlow.Description}</td>
                            <td><button class="btn btn-danger btn-sm delete-btn" data-id="${cashFlow.TransactionID}" type="button" style="width: 100%;">Delete</button></td>
                        </tr>
                    `
                    );
                });
                tbody.append(
                    `<tr>
    <td style="width: 5%;" contenteditable="false">${tbnum + 1}</td>
    <td class="text-capitalize" style="width: 15%;"><input id="cashflow-date" class="border-0" type="date" style="width: 100%;" /></td>
    <td class="text-capitalize" style="width: 15%;"><select id="cashflow-type" class="border-0" style="width: 100%;">
            <option value="Cash In">Cash In</option>
            <option value="Cash Out">Cash Out</option>
        </select></td>
    <td id="cashflow-amount" style="width: 10%;" contenteditable="true"></td>
    <td id="cashflow-description" class="text-capitalize text-center" contenteditable="true"></td>
    <td style="width: 10%;"><button id="add-cashflow-btn" class="btn btn-primary btn-sm add-btn" type="button" style="width: 100%;">Add</button></td>
</tr>`
                );
            },
            error: function (xhr, status, error) {
                console.error('Error:', error);
                alert('Failed to load borrowers. Please try again.');
            }

        });
        tbnum = 0;
    }

    $('#table-body').on('click', '.delete-btn', function () {
        var transactionID = $(this).data('id');
        $.ajax({
            url: urlx + `?id=${transactionID}`, // Update with the correct path to your API
            type: 'DELETE',
            success: function (response) {
                alert('Cash flow entry deleted successfully');
                loadcashflow();
            },
            error: function (xhr, status, error) {
                alert('Error: ' + xhr.responseJSON.message);
            }
        });
    });
});