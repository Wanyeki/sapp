const electron = require('electron');
const {ipcRenderer,remote}=electron;
const school=remote.require('./assets/js/school_info')

school_name=school.get_all().school_name
console.log(school_name)
document.querySelector('.school-name').textContent=school_name
login_btn = document.querySelector('.login-btn');
close_btn = document.querySelector('.closebtn')

close_btn.addEventListener('click', () => {
    ipcRenderer.send('close:login')
})

login_btn.addEventListener('click', () => {
    login_data={
        password : document.querySelector('.password').value,
        username : document.querySelector('.username').value
    }

    ipcRenderer.send('login:user',login_data);
})

ipcRenderer.on('show:error',e=>{
    document.querySelector('.error').style.display='block';
})