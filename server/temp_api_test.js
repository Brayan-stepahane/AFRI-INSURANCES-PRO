const fetch = globalThis.fetch || require('node-fetch');
(async () => {
  try {
    const registerRes = await fetch('http://localhost:3000/api/auth/register', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        identifiant: 'testadmin_' + Date.now(),
        password: 'Test1234!',
        nom: 'Test',
        prenom: 'Admin',
        role: 'admin',
        equipe: 'test',
        objectif_mensuel: 0
      })
    });
    const registerData = await registerRes.json();
    console.log('register status', registerRes.status, registerData);
    const token = registerData.token;
    const usersRes = await fetch('http://localhost:3000/api/users', {
      headers: { Authorization: `Bearer ${token}` }
    });
    const usersData = await usersRes.json();
    console.log('users status', usersRes.status, Array.isArray(usersData) ? usersData.length : usersData);
  } catch (err) {
    console.error(err);
  }
})();
