// Global variable to hold the connection
let db;

// Establishing a connection to the IndexedDb called 'budget_tracker' and it's set to version 1
const request = indexedDB.open('budget_tracker', 1);

// This event will trigger when the version changes from 1 to a higher value
request.onupgradeneeded = function(event) {

    // Saving a reference to the DB
    const db = event.target.result;

    // Creating an object store that contains an incremental primary key
    db.createObjectStore('new_budget', { autoIncrement: true });
};

// When we came back online
request.onsuccess = function(event) {

    // Saving reference
    db = event.target.result;

    // Checking if the application is online
    if (navigator.onLine) {

        // Uploading the data that was submitted when offline
        uploadBudgetEntries();
    }
};

// If error gets triggered
request.onerror = function(event) {

    // Console logging the error
    console.log(event.target.errorCode);
};

// A function that gets execucted when we attempt to submit a from while offline
function saveRecord(record) {

    // Opening a new transaction with the database with read/write permissions
    const transaction = db.transaction(['new_budget'], 'readwrite');

    // Accessing the transaction
    const budgetObjectStore = transaction.objectStore('new_budget');

    // Adding a new record
    budgetObjectStore.add(record);
}

// Executed when the application comes back online
function uploadBudgetEntries() {

    // Opening a new transaction with the database with read/write permissions
    const transaction = db.transaction(['new_budget'], 'readwrite');

    // Accessing the transaction
    const budgetObjectStore = transaction.objectStore('new_budget');

    // Retrieving all data from the IndexedDB
    const getAll = budgetObjectStore.getAll();

    // Posting the data to the database
    getAll.onsuccess = function() {
    
        if (getAll.result.length > 0) {
            fetch('/api/transaction', {
                    method: 'POST',
                    body: JSON.stringify(getAll.result),
                    headers: {
                        Accept: 'application/json, text/plain, */*',
                        'Content-Type': 'application/json'
                    }
                })
                .then(response => response.json())
                .then(serverResponse => {
                    if (serverResponse.message) {
                        throw new Error(serverResponse);
                    }
                    
                    // Opening a new transaction with the database with read/write permissions
                    const transaction = db.transaction(['new_budget'], 'readwrite');
               
                    // Accessing the transaction
                    const budgetObjectStore = transaction.objectStore('new_budget');
                    
                    // Clearing the IndexedDB
                    budgetObjectStore.clear();

                    // Informing the user of the update
                    alert('All saved budget entries has been submitted!');
                    location.reload();
                })
                .catch(err => {
                    console.log(err);
                });
        }
    };
}

// Listening for web application to come back online, and when online, upload all budget entries
window.addEventListener('online', uploadBudgetEntries);