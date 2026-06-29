// Basic functionality for the new BoardFlow Trello Clone UI

document.addEventListener('DOMContentLoaded', () => {
    //console.log('BoardFlow initialized.');

    // Simple add card interaction
    const addCardButtons = document.querySelectorAll('.btn-add-card');
    
    addCardButtons.forEach(btn => {
        btn.addEventListener('click', (e) => {
            const columnCards = e.target.closest('.column-cards');
            
            // Create a new empty card
            const newCard = document.createElement('div');
            newCard.className = 'card glass-card';
            newCard.innerHTML = `
                <h3 class="card-title" contenteditable="true">New Task...</h3>
                <p class="card-desc" contenteditable="true">Description</p>
                <div class="card-footer">
                    <div class="card-meta">
                        <span><i class="fa-regular fa-clock"></i> Just now</span>
                    </div>
                </div>
            `;
            
            // Insert before the add button
            columnCards.insertBefore(newCard, e.target);
            
            // Focus on the new task title
            const title = newCard.querySelector('.card-title');
            title.focus();
        });
    });
});
