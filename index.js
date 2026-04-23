const STORAGE_KEY = 'synsystems_subscriptions';

        // load all subscriptions from localStorage
        function loadSubscriptions() {
            const stored = localStorage.getItem(STORAGE_KEY);
            return stored ? JSON.parse(stored) : [];
        }

        // save all subscriptions to localStorage
        function saveSubscriptions(subscriptions) {
            localStorage.setItem(STORAGE_KEY, JSON.stringify(subscriptions));
        }

        // new subscription
        function addSubscription(formData) {
            const subscriptions = loadSubscriptions();
            subscriptions.push(formData);
            saveSubscriptions(subscriptions);
            return subscriptions;
        }

        // popup confirmation
        function showPopup(title, message, isSuccess = true) {
            const popup = document.getElementById('confirmationPopup');
            const popupTitle = document.getElementById('popupTitle');
            const popupMessage = document.getElementById('popupMessage');

            popupTitle.textContent = title;
            popupMessage.textContent = message;
            popup.style.display = 'flex';

            
        }

        function closePopup() {
            const popup = document.getElementById('confirmationPopup');
            popup.style.display = 'none';
        }

        // form submission
        document.getElementById('intakeForm').addEventListener('submit', function(e) {
            e.preventDefault();

            const fullname = document.getElementById('fullname').value.trim();
            const email = document.getElementById('email').value.trim();

            if (!fullname || !email) { // make sure at least one is filled
                showPopup('Error', 'Please fill in your name or email address.', false);
                return;
            }

            const formData = {
                id: Date.now(), // date as unique id
                time: new Date().toLocaleString(), // time actual 
                fullname: fullname, 
                email: email
            };

            addSubscription(formData); // add to local storage

            showPopup('Welcome!', `Thank you ${formData.fullname}! You're now subscribed to SynSystems.`); // show popup with user info 

            this.reset();// reset form after sub

            console.log('Subscription saved:', formData); // confirmation test 
            console.log('Total subscribers:', loadSubscriptions().length);// show num subs in console
        });

       

        console.log('To view all subscribers: Open DevTools (F12) → Application → Local Storage');
