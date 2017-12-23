materialCallback = null;

function materialAlert(title, text, callback) {
    document.getElementById('materialModalTitle').innerHTML = title;
    document.getElementById('materialModalText').innerHTML = text;
    document.getElementById('materialModalButtonCANCEL').style.display = 'none';
    document.getElementById('materialModal').className = 'show';
    materialCallback = callback;
}

function materialConfirm(title, text, callback) {
    materialAlert(title, text, callback);
    document.getElementById('materialModalButtonCANCEL').style.display = 'block';
}

function closeMaterialAlert(e, result) {
    e.stopPropagation();
    document.getElementById('materialModal').className = 'hide';
    if (typeof materialCallback == 'function') materialCallback(result);
}
window.addEventListener('load', function() {
    console.log('material-modal.js v1.1')
    var materialModal = document.createElement('div');
    materialModal.id = 'materialModal';
    materialModal.className = 'hide';
    materialModal.setAttribute('onclick', 'closeMaterialAlert(event, false);');
    var materialModalCentered = document.createElement('div');
    materialModalCentered.id = 'materialModalCentered'
    var materialModalContent = document.createElement('div');
    materialModalContent.id = 'materialModalContent'
    materialModalContent.setAttribute('onclick', 'event.stopPropagation();');
    var materialModalTitle = document.createElement('div');
    materialModalTitle.id = 'materialModalTitle'
    var materialModalText = document.createElement('div');
    materialModalText.id = 'materialModalText'
    var materialModalButtons = document.createElement('div');
    materialModalButtons.id = 'materialModalButtons'
    var materialModalButtonOK = document.createElement('div');
    materialModalButtonOK.id = 'materialModalButtonOK'
    materialModalButtonOK.className = 'materialModalButton'
    materialModalButtonOK.setAttribute('onclick', 'closeMaterialAlert(event, true);');
    materialModalButtonOK.innerHTML = 'OK'
    var materialModalButtonCANCEL = document.createElement('div');
    materialModalButtonCANCEL.id = 'materialModalButtonCANCEL'
    materialModalButtonCANCEL.className = 'materialModalButton'
    materialModalButtonCANCEL.setAttribute('onclick', 'closeMaterialAlert(event, false);');
    materialModalButtonCANCEL.innerHTML = 'CANCEL'
    materialModalButtons.appendChild(materialModalButtonOK);
    materialModalButtons.appendChild(materialModalButtonCANCEL);
    materialModalContent.appendChild(materialModalTitle)
    materialModalContent.appendChild(materialModalText)
    materialModalContent.appendChild(materialModalButtons)
    materialModalCentered.appendChild(materialModalContent)
    materialModal.appendChild(materialModalCentered);
    document.body.appendChild(materialModal)
})