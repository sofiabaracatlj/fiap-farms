### HTML

```html
<button class="atom-button" id="myButton">Click Me</button>
```

### CSS

```css
.atom-button {
    background-color: #007bff; /* Primary color */
    color: white; /* Text color */
    border: none; /* No border */
    border-radius: 4px; /* Rounded corners */
    padding: 10px 20px; /* Vertical and horizontal padding */
    font-size: 16px; /* Font size */
    cursor: pointer; /* Pointer cursor on hover */
    transition: background-color 0.3s; /* Smooth transition for hover effect */
}

.atom-button:hover {
    background-color: #0056b3; /* Darker shade on hover */
}

.atom-button:focus {
    outline: none; /* Remove default outline */
    box-shadow: 0 0 0 2px rgba(0, 123, 255, 0.5); /* Custom focus outline */
}
```

### JavaScript (Optional)

If you want to add some interactivity, you can use JavaScript:

```javascript
document.getElementById('myButton').addEventListener('click', function() {
    alert('Button clicked!');
});
```

### Explanation

1. **HTML**: The button is created using the `<button>` element with a class for styling and an ID for JavaScript interaction.
  
2. **CSS**: The styles define the button's appearance, including background color, text color, padding, border radius, and hover effects.

3. **JavaScript**: An event listener is added to the button to perform an action when it is clicked.

### Usage

You can include the HTML, CSS, and JavaScript in your web project to create a simple button component. This button can be further customized with additional properties, styles, or functionalities as needed. 

If you're using a specific framework or library, let me know, and I can provide a more tailored example!