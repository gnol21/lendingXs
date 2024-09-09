$(document).ready(function () {
    let urlx = 'https://iptv.givethanksgrocers.com/lending/loan.php';
    let tbnum = 0;

    function formatPrice(price) {
        return price.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
    }

    function isValidNumber(value) {
        return !isNaN(value) && value !== null && value !== "";
    }

    function displayLoadingState(isLoading) {
        if (isLoading) {
            $('#loading-spinner').show();
            $('button').prop('disabled', true);
        } else {
            $('#loading-spinner').hide();
            $('button').prop('disabled', false);
        }
    }

    function calculateFields() {
        let amount = parseFloat($('td.editable-loan-amount').text().replace(/[^0-9.-]+/g, ""));
        let interestRate = parseFloat($('td.editable-interest-rate').text()) / 100;
        let term = parseInt($('td.editable-term').text());

        if (isValidNumber(amount) && isValidNumber(interestRate) && isValidNumber(term) && term > 0) {
            let totalAmountDue = amount * (1 + (interestRate * term));
            let monthlyPayment = totalAmountDue / term;

            $('td.monthly-payment').text('₱' + formatPrice(monthlyPayment.toFixed(2)));
            $('td.total-amount-due').text('₱' + formatPrice(totalAmountDue.toFixed(2)));

            let startDate = new Date($('#loan-date').val());
            if (!isNaN(startDate.getTime())) {
                startDate.setMonth(startDate.getMonth() + term);
                let dueDate = startDate.toISOString().split('T')[0];
                $('td.due-date').text(dueDate);
            }
        } else {
            $('td.monthly-payment, td.total-amount-due, td.due-date').text('N/A');
        }
    }

    function clearInputFields() {
        $('td.editable-loan-amount, td.editable-interest-rate, td.editable-term').text('');
        $('#loan-date').val('');
        $('td.monthly-payment, td.total-amount-due, td.due-date').text('');
    }

    function fetchLoans() {
        displayLoadingState(true);
        $.ajax({
            url: urlx,
            method: 'GET',
            success: function (response) {
                let tbody = $('#table-body');
                tbody.empty();
                tbnum = 0;

                response.forEach(function (loan) {
                    tbnum++;
                    tbody.append(
                        `<tr data-id="${loan.LoanID}">
                            <td>${tbnum}</td>
                            <td class="text-capitalize">${loan.BorrowerName}</td>
                            <td>${loan.LoanDate}</td>
                            <td >₱${formatPrice(loan.LoanAmount)}</td>
                            <td >${loan.InterestRate}</td>
                            <td >${loan.TermMonths}</td>
                            <td>₱${formatPrice(loan.MonthlyPayment)}</td>
                            <td>₱${formatPrice(loan.TotalAmountDue)}</td>
                            <td>${loan.DueDate}</td>
                            <td class="text-center">
                                <button class="btn btn-danger btn-sm delete-btn" data-id="${loan.LoanID}" style="width: 100%;">Delete</button>
                            </td>
                        </tr>`
                    );
                });

                tbody.append(
                    `<tr>
                        <td>${tbnum+1}</td>
                        <td class="text-capitalize editable-name" contenteditable="true"></td>
                        <td><input id="loan-date" class="border-0" type="date" style="width: 100%;" /></td>
                        <td class="editable-loan-amount" contenteditable="true"></td>
                        <td class="editable-interest-rate" contenteditable="true"></td>
                        <td class="editable-term" contenteditable="true"></td>
                        <td class="table-secondary monthly-payment"></td>
                        <td class="table-secondary total-amount-due"></td>
                        <td class="table-secondary due-date"></td>
                        <td class="text-center"><button class="btn btn-primary btn-sm add-btn" type="button" style="width: 100%;">Add</button></td>
                    </tr>`
                );
                displayLoadingState(false);
            },
            error: function () {
                alert('Failed to fetch loans');
                displayLoadingState(false);
            }
        });
    }

    function deleteLoan(id) {
        if (confirm('Are you sure you want to delete this loan?')) {
            displayLoadingState(true);
            $.ajax({
                url: `${urlx}?id=${id}`,
                method: 'DELETE',
                success: function () {
                    alert('Loan deleted successfully');
                    fetchLoans();
                },
                error: function () {
                    alert('Failed to delete loan');
                    displayLoadingState(false);
                }
            });
        }
    }

    function addLoan() {
        let loanDate = $('#loan-date').val();
        let borrowerName = $('td.editable-name').text().trim();
        let amount = parseFloat($('td.editable-loan-amount').text().replace(/[^0-9.-]+/g, ""));
        let interestRate = parseFloat($('td.editable-interest-rate').text());
        let termMonths = parseInt($('td.editable-term').text());
        let status = 'Active';

        if (borrowerName && isValidNumber(amount) && isValidNumber(interestRate) && isValidNumber(termMonths)) {
            displayLoadingState(true);
            $.ajax({
                url: urlx,
                method: 'POST',
                contentType: 'application/json',
                data: JSON.stringify({
                    borrowerName: borrowerName,
                    loanDate: loanDate,
                    loanAmount: amount,
                    interestRate: interestRate,
                    termMonths: termMonths,
                    status: status
                }),
                success: function () {
                    alert('Loan added successfully');
                    clearInputFields();
                    fetchLoans();
                },
                error: function (xhr, status, error) {
                    console.error('Error:', error);
                    var jsonResponse = JSON.parse(xhr.responseText);
                    alert('Error: ' + jsonResponse.message);  // Accessing the message
                    displayLoadingState(false);
                }
            });
        } else {
            alert('Please fill in all required fields correctly.');
        }
    }

    function editLoan(loanRow) {
        const loanId = loanRow.data('id');
        const loanAmount = loanRow.find('.editable-loan-amount').text().replace(/[^0-9.-]+/g, "");
        const interestRate = loanRow.find('.editable-interest-rate').text();
        const termMonths = loanRow.find('.editable-term').text();

        // Ensure the input data is valid
        if (isValidNumber(loanAmount) && isValidNumber(interestRate) && isValidNumber(termMonths)) {
            $.ajax({
                url: `${urlx}?id=${loanId}`,
                method: 'PUT',
                contentType: 'application/json',
                data: JSON.stringify({
                    loanAmount: parseFloat(loanAmount),
                    interestRate: parseFloat(interestRate),
                    termMonths: parseInt(termMonths)
                }),
                success: function () {
                    alert('Loan updated successfully');
                    fetchLoans(); // Refresh the table
                },
                error: function () {
                    alert('Failed to update loan');
                }
            });
        } else {
            alert('Please provide valid numbers for all fields.');
        }
    }

    // Event delegation for Add button
    $(document).on('click', '.add-btn', function () {
        addLoan();
    });

    // Event delegation for Delete button
    $(document).on('click', '.delete-btn', function () {
        let id = $(this).data('id');
        deleteLoan(id);
    });

    // Event delegation for Edit button
    $(document).on('click', '.edit-btn', function () {
        let loanRow = $(this).closest('tr');

        // Toggle the fields to be editable
        loanRow.find('.editable-loan-amount, .editable-interest-rate, .editable-term').attr('contenteditable', true);
        $(this).text('Save').removeClass('edit-btn btn-warning').addClass('save-btn btn-success');
    });

    // Event delegation for Save button
    $(document).on('click', '.save-btn', function () {
        let loanRow = $(this).closest('tr');
        editLoan(loanRow);
    });

    // Trigger calculation when inputs change
    $(document).on('input', 'td[contenteditable="true"], #loan-date', function () {
        calculateFields();
    });

    // Initial fetch of loans
    fetchLoans();
});
