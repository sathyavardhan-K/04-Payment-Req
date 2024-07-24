

// let send_email = document.getElementById('send-email');
// send_email.addEventListener('click', SendEmail);




// function SendEmail(to = 'nandha.kumar@gwcdata.ai', subject = "test", body = "Test Email") {

//   console.log("Sending Email to====>", to);
//   const startWorkflow = (alias, body) => {
//     domo.post(`/domo/workflow/v1/models/${alias}/start`, body)
//     .then(response => {
//         console.log('Workflow started successfully:', response);
//       })
//       .catch(error => {
//         console.error('Error starting workflow:', error);
//       });
//   }

//   startWorkflow("send_email", { to: "nandha.kumar@gwcdata.ai", sub: subject, body: body });

// }








document.addEventListener('DOMContentLoaded', function() {
    const selectElement = document.getElementById('userList');
    const username = document.getElementById('name');
    const useremail = document.getElementById('email');
    const amountInput = document.getElementById('amount');
    const dueDateInput = document.getElementById('due-date');
    const currencySelect = document.getElementById('currency');
    const formattedDateDiv = document.getElementById('formatted-date');
    const destinationAccountSelect = document.getElementById('destination-account');
    const daysDifferenceDiv = document.getElementById('days-difference');
    const companySelect = document.getElementById('company');
    const emailToNameMap = {};
    const emailToIdMap = {};

    // Variable to store the current user's display name
    let currentUserDisplayName = '';
    let currentUserId = '';
    // Set today's date as the minimum date for the due date input
    const today = new Date().toISOString().split('T')[0];
    dueDateInput.setAttribute('min', today);

    // Function to format the date
    function formatDate(date) {
        const options = { year: 'numeric', month: 'short', day: 'numeric' };
        return new Date(date).toLocaleDateString('en-US', options);
    }

    // Update formatted date display when the due date input changes
    // dueDateInput.addEventListener('change', function() {
    //     const selectedDate = dueDateInput.value;
    //     formattedDateDiv.textContent = formatDate(selectedDate);
    // });

        // Function to calculate the difference in days
        function calculateDaysDifference(startDate, endDate) {
            const oneDay = 24 * 60 * 60 * 1000; // One day in milliseconds
            const start = new Date(startDate);
            const end = new Date(endDate);
            return Math.round((end - start) / oneDay);
        }
    
        // Update formatted date display and days difference when the due date input changes
        dueDateInput.addEventListener('change', function() {
            const selectedDate = dueDateInput.value;
            formattedDateDiv.textContent = formatDate(selectedDate);
            const daysDifference = calculateDaysDifference(today, selectedDate);
            daysDifferenceDiv.textContent = `Days until due date: ${daysDifference}`;
        });

    // Fetch up to 140 users
    domo.get('/domo/users/v1?includeDetails=true&limit=140')
        .then(function(usersData) {
            console.log('Users data:', usersData);
            usersData.forEach(function(user) {
                let option = document.createElement('option');
                option.value = user.detail.email; // Assuming user.detail.email is correct
                option.textContent = user.displayName; // Display user's name

                selectElement.appendChild(option);
                emailToNameMap[user.detail.email] = user.displayName;
                emailToIdMap[user.detail.email] = user.id;
            });

            // Initialize Tom Select with placeholder
            new TomSelect(selectElement, {
                plugins: ['remove_button'],
                create: false,
                sortField: {
                    field: 'text',
                    direction: 'asc'
                }
            });
        })
        .catch(function(error) {
            console.error('Error fetching users:', error);
        });

        domo.get(`/domo/users/v1?includeDetails=true&limit=1`).then(function(data){

            let currentUser = domo.env.userId;
            
            domo.get(`/domo/users/v1/${currentUser}?includeDetails=true`)
            .then(function(data){
                console.log(data);
                // let pic = document.getElementById("pic");
                // let avatar = document.getElementById("avatar");
                // // avatar.innerHTML = data.avatarKey;
                // cosnsole.log("avatar" ,avatarKey);
                let pTag = document.getElementById("myname");
                pTag.textContent = `Welcome ${data.displayName}!`; 
                let avatarkey = data.avatarKey;
                document.getElementById('avatar').setAttribute('src',`${avatarkey}`);
                currentUserDisplayName = data.displayName;
                currentUserId = data.id;
                
            })
        })
        

    function validateForm() {

        const selectedOptions = selectElement.tomselect.getValue();
        console.log(selectedOptions);
        if (selectedOptions.length === 0 || selectedOptions[0] === "") {
            alert("Please select at least one person.");
            return false;
        }


        if(!username.value.trim()){
            alert("Please enter your name.");
            username.focus();
            return false;
        }


        if(!useremail.value.trim()){
            alert("Please enter your email.");
            useremail.focus();
            return false;
        }


        if (!amountInput.value.trim()) {
            alert("Please enter the amount.");
            amountInput.focus();
            return false;
        }

        if (!dueDateInput.value.trim()) {
            alert("Please select a due date.");
            dueDateInput.focus();
            return false;
        }

        if (!destinationAccountSelect.value.trim()) {
            alert("Please select a destination account.");
            destinationAccountSelect.focus();
            return false;
        }

        if (!companySelect.value.trim()) {
            alert("Please select a company.");
            companySelect.focus();
            return false;
        }

        return true;
    }

    function send() {
        if (!validateForm()) {
            return;
        }

        const selectedOptions = selectElement.tomselect.getValue();
        const selectedNames = selectedOptions.map(email => emailToNameMap[email]);
        const amount = `${currencySelect.value}${amountInput.value}`;
        const name = username.value;
        const email = useremail.value;
        const dueDate = formatDate(dueDateInput.value);
        const destinationAccount = destinationAccountSelect.value;
        const company = companySelect.options[companySelect.selectedIndex].text;

        const selectedIds = [];


        selectedOptions.forEach(email => {
            const displayName = emailToNameMap[email];
            const userId = emailToIdMap[email];
            selectedIds.push(userId);
            
             // <h2>Payment Request</h2>
                    // <p>Destination Account: ${destinationAccount}</p>
                    // <p>Amount: ${amount}</p>
                    // <p>Due Date: ${dueDate}</p>
                    // <p>Request sent to: ${displayName}</p>

            const emailBody = ` 

                    <h1 style="margin-bottom: 5px; font-size: 16px;">Hi ${displayName},</h1>
    
                    <p>${company} ${currentUserDisplayName} requested <span style="font-weight: bold; margin-bottom: 2px;">${amount}</span> payment.</p>
                    
                    <p style="margin-bottom:10px;">You need to make a payment before <span style="text-decoration: underline;">${dueDate}</span>.</p>
            
                    <p>Thanks,</p>
                    <p>${currentUserDisplayName}</p>
                    `;
                const emailSubject = `Payment Request from ${company} for ${currentUserDisplayName}`;
                SendEmail(email,emailSubject,emailBody);


                // Used to store in db

                    const finalData = {
                        "content":{
                                'requested_by': {
                                    'name': `${currentUserDisplayName}`,
                                    'user_id': `${currentUserId}`
                                },
                                
                                'requested_to': {
                                    'user_id': `${selectedIds}`,
                                    'name':  `${displayName}`,
                                    'user_email': `${email}`
                                },
                                'contact_details': {
                                    'name': `${displayName}`,
                                    'email': `${email}`
                                },
                                'request_details': {
                                    'amount': {
                                        'currency': `${currencySelect.value}`,
                                        'amount': `${amount}`,
                                        'due_date': `${dueDate}`
                                    }
                                },
                                'company_name': `${company}`,
                                'destination_account': `${destinationAccount}`
                            }
                        }
                    
                    domo.post(`/domo/datastores/v1/collections/payment/documents/`,finalData)
                            .then(response => {
                                        console.log('Payment Request Created:', response);
                                        alert('Payment request submitted successfully!');
                            })


                    // domo.post(`/domo/datastores/v1/collections/Payment-req-db/documents/`, finalData)
                    //     .then(response => {
                    //         console.log('Payment Request Created:', response);
                    //         alert('Payment request submitted successfully!');
                    //     })
                    //     .catch(error => {
                    //         console.error('Error sending data to Domo:', error);
                    //         alert('Failed to submit payment request.');
                    //     });
            // SendEmail(email, "Payment Request", `Destination Account: ${destinationAccount}\nAmount: ${amount}\nDue Date: ${dueDate}\nRequest sent to: ${displayName}`);
        });

        displayMessage(selectedOptions, selectedNames);
        clearForm();


        console.log(selectedIds);

        // Clear the form and selected options
        function clearForm(){
            username.value = '';
            useremail.value = '';
            amountInput.value = '';
            dueDateInput.value = '';
            companySelect.value = '';
            formattedDateDiv.textContent = '';
            destinationAccountSelect.value = '';
            daysDifferenceDiv.textContent = '';
            selectElement.tomselect.clear();
        }
    }

    document.getElementById('send-email').addEventListener('click', send);
});

function SendEmail(to, subject = "Payment Request", body) {
    console.log("Sending Email to:", to);

    const startWorkflow = (alias, body) => {
        domo.post(`/domo/workflow/v1/models/${alias}/start`, body)
            .then(response => {
                console.log('Workflow started successfully:', response);
            })
            .catch(error => {
                console.error('Error starting workflow:', error);
            });
    }

    startWorkflow("send_email", { to: to, sub: subject, body: body });
}

function displayMessage(emails, names) {
    alert(`Emails sent to: ${names.join(', ')}`);
}







