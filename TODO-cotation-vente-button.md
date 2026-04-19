# TODO: Hide "Convertir en vente" button after conversion

## Approved Plan - Steps:

✅ **1. Create TODO.md** - [DONE]

**2. Edit server/routes/cotations.js**  
   - GET /api/cotations → JOIN ventes v ON c.id = v.cotation_id  
   - Add `v.id as vente_id` to SELECT

**3. Edit Afri-pro/app/(app)/cotations.tsx**  
   - Button condition: `{c.statut === 'Validée' && !c.vente_id && (...)}`

**4. (Optional) Update Cotation type** - `src/types/api.types.ts`

**5. Test**: 
   - Convert cotation → refresh → button hidden

**6. Complete** ✅

*Progress: 1/6*

