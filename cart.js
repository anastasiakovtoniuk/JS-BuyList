document.addEventListener('DOMContentLoaded', () => {
    const itemInput = document.querySelector('.input-section input[type="text"]');
    const addButton = document.querySelector('.add-button');
    const itemList = document.querySelector('.item-list');
    const remainingItemsContainer = document.querySelector('.remaining-items .summary-tags');
    const boughtItemsContainer = document.querySelector('.bought-items .summary-tags');

    const createItemElement = (itemData) => {
        const { name, quantity, bought } = itemData;

        const item = document.createElement('div');
        item.className = 'cart-item';

        const nameSpan = document.createElement('span');
        nameSpan.className = 'item-name';
        nameSpan.textContent = name;

        const controls = document.createElement('div');
        controls.className = 'quantity-controls';

        const minusBtn = document.createElement('button');
        minusBtn.className = 'quantity-minus';
        minusBtn.textContent = '-';
        minusBtn.dataset.tooltip = 'Зменшити кількість';
        minusBtn.disabled = quantity <= 1;

        const quantityDisplay = document.createElement('span');
        quantityDisplay.className = 'quantity-display';
        quantityDisplay.textContent = quantity;

        const plusBtn = document.createElement('button');
        plusBtn.className = 'quantity-plus';
        plusBtn.textContent = '+';
        plusBtn.dataset.tooltip = 'Збільшити кількість';

        controls.append(minusBtn, quantityDisplay, plusBtn);

        const statusBtn = document.createElement('button');
        statusBtn.dataset.tooltip = bought ? 'Позначити як не куплено' : 'Позначити як куплено';
        statusBtn.textContent = bought ? 'Куплено' : 'Не куплено';
        
        const deleteBtn = document.createElement('button');
        deleteBtn.className = 'delete-button';
        deleteBtn.innerHTML = '&times;';
        deleteBtn.dataset.tooltip = 'Видалити товар';

        item.append(nameSpan, controls, statusBtn, deleteBtn);

        if (bought) {
            item.classList.add('bought');
            statusBtn.className = 'status-button bought-button';
            nameSpan.style.textDecoration = 'line-through';
            controls.style.display = 'none';
            deleteBtn.style.display = 'none';
        } else {
            statusBtn.className = 'status-button not-bought';
        }
        
        return item;
    };

    const addItem = () => {
        const itemName = itemInput.value.trim();
        if (itemName) {
            const newItem = createItemElement({ name: itemName, quantity: 1, bought: false });
            itemList.appendChild(newItem);
            itemInput.value = '';
            itemInput.focus();
            updateApp();
        }
    };

    const updateStatistics = () => {
        const allItems = itemList.querySelectorAll('.cart-item');
        remainingItemsContainer.innerHTML = '';
        boughtItemsContainer.innerHTML = '';

        allItems.forEach(item => {
            const name = item.querySelector('.item-name').textContent;
            const quantity = item.querySelector('.quantity-display').textContent;
            const tagHTML = `<span class="summary-tag">${name} <span class="tag-quantity">${quantity}</span></span>`;

            if (item.classList.contains('bought')) {
                boughtItemsContainer.insertAdjacentHTML('beforeend', tagHTML);
            } else {
                remainingItemsContainer.insertAdjacentHTML('beforeend', tagHTML);
            }
        });
    };

    const saveState = () => {
        const allItemsData = [];
        itemList.querySelectorAll('.cart-item').forEach(item => {
            allItemsData.push({
                name: item.querySelector('.item-name').textContent,
                quantity: parseInt(item.querySelector('.quantity-display').textContent),
                bought: item.classList.contains('bought')
            });
        });
        localStorage.setItem('shoppingListState', JSON.stringify(allItemsData));
    };

    const loadState = () => {
        itemList.innerHTML = '';
        const savedStateJSON = localStorage.getItem('shoppingListState');
        const savedState = savedStateJSON ? JSON.parse(savedStateJSON) : null;

        if (savedState && savedState.length > 0) {
            savedState.forEach(itemData => {
                const itemElement = createItemElement(itemData);
                itemList.appendChild(itemElement);
            });
        } else {
            const initialItems = ['Помідори', 'Печиво', 'Сир'];
            initialItems.forEach(name => {
                const itemElement = createItemElement({ name, quantity: 1, bought: false });
                itemList.appendChild(itemElement);
            });
        }
    };
    
    const updateApp = () => {
        updateStatistics();
        saveState();
    };

    addButton.addEventListener('click', addItem);
    itemInput.addEventListener('keypress', (event) => {
        if (event.key === 'Enter') {
            addItem();
        }
    });

    itemList.addEventListener('click', (event) => {
        const target = event.target;
        const item = target.closest('.cart-item');
        if (!item) return;

        let needsUpdate = false;

        if (target.matches('.delete-button')) {
            item.remove();
            needsUpdate = true;
        } else if (target.matches('.status-button')) {
            const isBought = item.classList.toggle('bought');
            const itemNameSpan = item.querySelector('.item-name');
            const quantityControls = item.querySelector('.quantity-controls');
            const deleteButton = item.querySelector('.delete-button');
            
            target.textContent = isBought ? 'Куплено' : 'Не куплено';
            target.className = isBought ? 'status-button bought-button' : 'status-button not-bought';
            itemNameSpan.style.textDecoration = isBought ? 'line-through' : 'none';
            quantityControls.style.display = isBought ? 'none' : 'flex';
            deleteButton.style.display = isBought ? 'none' : 'flex';
            
            needsUpdate = true;
        } else if (target.matches('.quantity-plus')) {
            const quantityDisplay = item.querySelector('.quantity-display');
            const quantityMinus = item.querySelector('.quantity-minus');
            quantityDisplay.textContent = parseInt(quantityDisplay.textContent) + 1;
            quantityMinus.disabled = false;
            needsUpdate = true;
        } else if (target.matches('.quantity-minus')) {
            const quantityDisplay = item.querySelector('.quantity-display');
            let quantity = parseInt(quantityDisplay.textContent);
            if (quantity > 1) {
                quantityDisplay.textContent = --quantity;
                if (quantity === 1) target.disabled = true;
                needsUpdate = true;
            }
        } else if (target.matches('.item-name') && !item.classList.contains('bought')) {
            const currentName = target.textContent;
            const input = document.createElement('input');
            input.type = 'text';
            input.className = 'item-name';
            input.value = currentName;
            
            target.replaceWith(input);
            input.focus();

            const saveChanges = () => {
                const newName = input.value.trim() || currentName;
                const newSpan = document.createElement('span');
                newSpan.className = 'item-name';
                newSpan.textContent = newName;
                input.replaceWith(newSpan);
                if (currentName !== newName) {
                    updateApp();
                }
            };

            input.addEventListener('blur', saveChanges);
            input.addEventListener('keypress', (e) => {
                if (e.key === 'Enter') e.target.blur();
            });
        }
        
        if (needsUpdate) {
            updateApp();
        }
    });

    loadState();
    updateApp();
});