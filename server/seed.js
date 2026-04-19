require('dotenv').config();
const bcrypt = require('bcryptjs');
const pool = require('./db');
const fs = require('fs');
const path = require('path');

const seedDatabase = async () => {
  try {
    console.log('🌱 Starting database seed...');
    
    // 1. Run the SQL schema from the file
    const sqlFile = path.join(__dirname, 'schema.sql');
    if (fs.existsSync(sqlFile)) {
      console.log('📄 Found schema.sql, running schema...');
      const schemaSql = fs.readFileSync(sqlFile, 'utf8');
      try {
        await pool.query(schemaSql);
        console.log('✅ Schema created successfully');
      } catch (schemaError) {
        if (schemaError.code === '42P07') {
          console.log('⚠️  Tables already exist, continuing with user insertion...');
        } else {
          throw schemaError;
        }
      }
    } else {
      console.log('⚠️  schema.sql not found, skipping...');
    }

    // 2. Hash the default password
    const plainPassword = 'pass123';
    const hashedPassword = await bcrypt.hash(plainPassword, 10);
    console.log(`🔐 Password 'pass123' hashed successfully`);

    // 3. Insert users with hashed passwords
    const users = [
      // Commerciaux
      { nom: 'NGUEGUIM', prenom: 'Jean', identifiant: 'ngueguim', role: 'commercial', equipe: 'A', objectif: 500000 },
      { nom: 'ONGOMALELA', prenom: 'Marie', identifiant: 'ongomalela', role: 'commercial', equipe: 'A', objectif: 400000 },
      { nom: 'MBA MAMBA', prenom: 'Léocadie', identifiant: 'mbamamba', role: 'commercial', equipe: 'B', objectif: 400000 },
      { nom: 'MAHOT', prenom: 'Paul', identifiant: 'mahot', role: 'commercial', equipe: 'B', objectif: 450000 },
      { nom: 'AMENA', prenom: 'Claire', identifiant: 'amena', role: 'commercial', equipe: 'A', objectif: 350000 },
      { nom: 'YANNICK', prenom: 'Yannick', identifiant: 'yannick', role: 'commercial', equipe: 'B', objectif: 500000 },
      // Manager adjoint
      { nom: 'ONANA', prenom: 'Roger', identifiant: 'onana', role: 'manager_adjoint', equipe: 'A', objectif: 0 },
      // Manager
      { nom: 'NGONO', prenom: 'Sophie', identifiant: 'ngono', role: 'manager', equipe: 'ALL', objectif: 0 },
      // chef_agence agence
      { nom: 'DJEUKEU', prenom: 'Albert', identifiant: 'djeukeu', role: 'chef_agence', equipe: 'ALL', objectif: 0 },
      // Admin
      { nom: 'ADMIN', prenom: 'Système', identifiant: 'admin', role: 'admin', equipe: 'ALL', objectif: 0 },
    ];

    const insertUserQuery = `
      INSERT INTO users (nom, prenom, identifiant, mot_de_passe, role, equipe, objectif_mensuel, active)
      VALUES ($1, $2, $3, $4, $5, $6, $7, true)
      ON CONFLICT (identifiant) DO UPDATE
      SET mot_de_passe = EXCLUDED.mot_de_passe,
          nom = EXCLUDED.nom,
          prenom = EXCLUDED.prenom,
          role = EXCLUDED.role,
          equipe = EXCLUDED.equipe,
          objectif_mensuel = EXCLUDED.objectif_mensuel
      RETURNING id, identifiant;
    `;

    for (const user of users) {
      try {
        const result = await pool.query(insertUserQuery, [
          user.nom,
          user.prenom,
          user.identifiant,
          hashedPassword,
          user.role,
          user.equipe,
          user.objectif
        ]);
        if (result.rows.length > 0) {
          console.log(`✅ User created/updated: ${user.identifiant} (${user.role})`);
        }
      } catch (e) {
        console.warn(`⚠️  Could not insert user ${user.identifiant}:`, e.message);
      }
    }

    // 4. Fix sequence for clients
    try {
      // Get the highest client number currently in database
      const maxClientRes = await pool.query(`
        SELECT COUNT(*) as count FROM clients
      `);
      const maxCount = parseInt(maxClientRes.rows[0].count, 10);
      
      // Reset the sequence to start at the next available number
      await pool.query(`
        SELECT setval('client_seq', ${maxCount + 1})
      `);
      console.log(`✅ Fixed client_seq sequence (next ID will be CLI-${String(maxCount + 1).padStart(4, '0')})`);
    } catch (seqError) {
      console.warn('⚠️  Could not reset sequence:', seqError.message);
    }

    // 5. Verify seed data
    const result = await pool.query(`
      SELECT 
        (SELECT COUNT(*) FROM users) as users_count,
        (SELECT COUNT(*) FROM clients) as clients_count,
        (SELECT COUNT(*) FROM produits) as produits_count,
        (SELECT COUNT(*) FROM prospections) as prospections_count,
        (SELECT COUNT(*) FROM cotations) as cotations_count,
        (SELECT COUNT(*) FROM ventes) as ventes_count
    `);

    const counts = result.rows[0];
    console.log('\n📊 Database statistics:');
    console.log(`  👤 Users: ${counts.users_count}`);
    console.log(`  🏢 Clients: ${counts.clients_count}`);
    console.log(`  📦 Produits: ${counts.produits_count}`);
    console.log(`  🔍 Prospections: ${counts.prospections_count}`);
    console.log(`  📋 Cotations: ${counts.cotations_count}`);
    console.log(`  💰 Ventes: ${counts.ventes_count}`);

    console.log('\n✅ Database seeding completed successfully!');
    console.log('\n🔐 Test credentials:');
    console.log('  Username: ngueguim');
    console.log('  Password: pass123');
    console.log('  Role: commercial\n');

    process.exit(0);
  } catch (error) {
    console.error('❌ Error seeding database:', error.message);
    console.error(error);
    process.exit(1);
  }
};

seedDatabase();
