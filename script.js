
const fieldTypes = {};
const resourceTypes = [];
const eventTypes = [];
const owners = [];

function showPreview(input) {
    const preview = document.getElementById('imagePreview');
    preview.innerHTML = '';
    if (input.files && input.files[0]) {
        const reader = new FileReader();
        reader.onload = function(e) {
            const img = document.createElement('img');
            img.src = e.target.result;
            preview.appendChild(img);
        };
        reader.readAsDataURL(input.files[0]);
    }
}

function addResType() {
    const val = document.getElementById('newResType').value.trim();
    if (val && !resourceTypes.includes(val)) {
        resourceTypes.push(val);
        updateDropdown('ftRes', resourceTypes);
    }
}

function addEventType() {
    const val = document.getElementById('newEventType').value.trim();
    if (val && !eventTypes.includes(val)) {
        eventTypes.push(val);
        updateDropdown('ftEvent', eventTypes);
    }
}

function addOwner() {
    const val = document.getElementById('newOwner').value.trim();
    if (val && !owners.includes(val)) {
        owners.push(val);
        updateDropdown('ftOwner', owners);
    }
}

function toggleOwner() {
    document.getElementById('ownerSection').style.display =
        document.getElementById('ownerToggle').checked ? 'block' : 'none';
}

function updateDropdown(id, values) {
    const sel = document.getElementById(id);
    sel.innerHTML = '';
    values.forEach(v => {
        const opt = document.createElement('option');
        opt.value = v;
        opt.textContent = v;
        sel.appendChild(opt);
    });
}

function saveFieldType() {
    const name = document.getElementById('ftName').value.trim();
    if (!name) return alert('Name erforderlich');

    const move = [];
    if (document.getElementById('moveLand').checked) move.push('land');
    if (document.getElementById('moveWater').checked) move.push('water');
    if (document.getElementById('moveAir').checked) move.push('air');

    const ft = {
        name,
        allowedMovementTypes: [...new Set(move)],
        movementCost: parseInt(document.getElementById('ftMove').value),
        unitCapacity: parseInt(document.getElementById('ftCap').value),
        citySize: parseInt(document.getElementById('ftCitySize').value),
        hasSupplyDepot: document.getElementById('ftSupply').checked,
        resourceType: document.getElementById('ftRes').value || 'none',
        eventTag: document.getElementById('ftEvent').value || 'none',
        owner: document.getElementById('ownerToggle').checked ? (document.getElementById('ftOwner').value || 'none') : 'none',
        image: ''
    };

    const imageInput = document.getElementById('ftImage');
    if (imageInput.files.length > 0) {
        const reader = new FileReader();
        reader.onload = function(e) {
            ft.image = e.target.result; // base64
            fieldTypes[name] = ft;
            renderFieldTypes();
            saveToLocal();
        };
        reader.readAsDataURL(imageInput.files[0]);
    } else {
        fieldTypes[name] = ft;
        renderFieldTypes();
        saveToLocal();
    }
}

function renderFieldTypes() {
    const list = document.getElementById('tileList');
    list.innerHTML = '';
    Object.values(fieldTypes).forEach(ft => {
        const div = document.createElement('div');
        div.className = 'tile-entry';
        const title = document.createElement('div');
        title.innerHTML = '<strong>' + ft.name + '</strong>';
        const img = document.createElement('img');
        img.src = ft.image || '';
        const btnEdit = document.createElement('button');
        btnEdit.textContent = '✏️';
        btnEdit.onclick = () => loadFieldType(ft.name);
        const btnDelete = document.createElement('button');
        btnDelete.textContent = '🗑️';
        btnDelete.onclick = () => {
            if (confirm('Feldtyp wirklich löschen?')) {
                delete fieldTypes[ft.name];
                renderFieldTypes();
                saveToLocal();
            }
        };
        div.append(title, img, btnEdit, btnDelete);
        list.appendChild(div);
    });
}

function loadFieldType(name) {
    const ft = fieldTypes[name];
    if (!ft) return;
    document.getElementById('ftName').value = ft.name;
    document.getElementById('moveLand').checked = ft.allowedMovementTypes.includes('land');
    document.getElementById('moveWater').checked = ft.allowedMovementTypes.includes('water');
    document.getElementById('moveAir').checked = ft.allowedMovementTypes.includes('air');
    document.getElementById('ftMove').value = ft.movementCost;
    document.getElementById('ftCap').value = ft.unitCapacity;
    document.getElementById('ftCitySize').value = ft.citySize;
    document.getElementById('ftSupply').checked = ft.hasSupplyDepot;

    if (ft.resourceType !== 'none' && !resourceTypes.includes(ft.resourceType)) {
        resourceTypes.push(ft.resourceType);
        updateDropdown('ftRes', resourceTypes);
    }
    if (ft.eventTag !== 'none' && !eventTypes.includes(ft.eventTag)) {
        eventTypes.push(ft.eventTag);
        updateDropdown('ftEvent', eventTypes);
    }
    if (ft.owner !== 'none' && !owners.includes(ft.owner)) {
        owners.push(ft.owner);
        updateDropdown('ftOwner', owners);
    }

    document.getElementById('ftRes').value = ft.resourceType;
    document.getElementById('ftEvent').value = ft.eventTag;

    if (ft.owner !== 'none') {
        document.getElementById('ownerToggle').checked = true;
        toggleOwner();
        document.getElementById('ftOwner').value = ft.owner;
    } else {
        document.getElementById('ownerToggle').checked = false;
        toggleOwner();
    }

    const preview = document.getElementById('imagePreview');
    preview.innerHTML = '';
    if (ft.image) {
        const img = document.createElement('img');
        img.src = ft.image;
        preview.appendChild(img);
    }
}


function importFieldTypes(event) {
    const file = event.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = function(e) {
        try {
            const imported = JSON.parse(e.target.result);
            Object.assign(fieldTypes, imported);
            renderFieldTypes();
            saveToLocal();
        } catch (err) {
            alert("Fehler beim Import.");
        }
    };
    reader.readAsText(file);
}

function saveToLocal() {
    localStorage.setItem("fieldTypes", JSON.stringify(fieldTypes));
}

function loadFromLocal() {
    const data = localStorage.getItem("fieldTypes");
    if (data) {
        const parsed = JSON.parse(data);
        Object.assign(fieldTypes, parsed);
        renderFieldTypes();
    }
}


function exportFieldTypes() {
    const dataStr = JSON.stringify(fieldTypes, null, 2);
    const blob = new Blob([dataStr], { type: "application/json" });
    let name = document.getElementById("jsonName").value.trim();
    if (!name) name = "fieldTypes_export";
    if (!name.endsWith(".json")) name += ".json";
    saveAs(blob, name);
}


function clearFieldTypes() {
    if (confirm("Alle gespeicherten Feldtypen löschen?")) {
        localStorage.removeItem("fieldTypes");
        for (const key in fieldTypes) delete fieldTypes[key];
        renderFieldTypes();
    }
}

/* Projekteditor Funktion*/
/* Save Funktion für das Projekt*/
function saveProjectType() {
    const name = document.getElementById('ftName').value.trim();
    if (!name) return alert('Name erforderlich');
    
    const ft = {
        name,
        image: ''
    };

    const imageInput = document.getElementById('ftImage');
    if (imageInput.files.length > 0) {
        const reader = new FileReader();
        reader.onload = function(e) {
            ft.image = e.target.result; // base64
            fieldTypes[name] = ft;
            renderFieldTypes();
            saveToLocal();
        };
        reader.readAsDataURL(imageInput.files[0]);
    } else {
        fieldTypes[name] = ft;
        renderFieldTypes();
        saveToLocal();
    }
}

/* Projekteditor Funktion*/
/* Load Funktion für das Projekt*/
function loadProjectFromLocal() {
    const data = localStorage.getItem("Projektname");
    if (data) {
        const parsed = JSON.parse(data);
        Object.assign(ProjectTypes, parsed);
        renderProjectTypes();
    }
}
/* Projekteditor Funktion*/
/* Import Funktion für das Projekt*/

function importFieldTypes(event) {
    const file = event.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = function(e) {
        try {
            const imported = JSON.parse(e.target.result);
            Object.assign(ProjectTypes, imported);
            renderprojectTypes();
            saveToLocal();
        } catch (err) {
            alert("Fehler beim Import.");
        }
    };
    reader.readAsText(file);
}