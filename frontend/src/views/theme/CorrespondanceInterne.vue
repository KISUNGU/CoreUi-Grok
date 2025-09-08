<template>
  <CRow class="flex-column">
    <!-- Section Liste -->
    <CCol xs="12">
      <CCard class="shadow-sm border-0 outlook-card">
        <CCardHeader class="outlook-header">
          <strong><i class="cil-list me-2"></i> Liste des Correspondances Internes</strong>
        </CCardHeader>
        <CCardBody>
          <div class="outlook-toolbar d-flex align-items-center mb-3">
            <button @click="showAddModal = true" class="btn btn-outline-primary custom-btn icon-btn me-2" title="Ajouter une correspondance">
              <i class="cil-plus"></i>
            </button>
            <button @click="$refs.importInput.click()" class="btn btn-outline-primary custom-btn icon-btn me-2" title="Importer depuis Excel">
              <i class="cil-cloud-upload"></i>
            </button>
            <input
              type="file"
              style="display: none;"
              ref="importInput"
              accept=".xlsx,.xls,.csv"
              @change="importFromExcel"
            />
            <button @click="exportToExcel" class="btn btn-outline-primary custom-btn icon-btn me-2" title="Exporter vers Excel">
              <i class="cil-cloud-download"></i>
            </button>
            <button @click="printTable" class="btn btn-outline-primary custom-btn icon-btn me-2" title="Imprimer">
              <i class="cil-print"></i>
            </button>
            <button @click="$refs.scanInput.click()" class="btn btn-outline-primary custom-btn icon-btn" title="Scanner un document">
              <i class="cil-scan"></i>
            </button>
            <input
              type="file"
              style="display: none;"
              ref="scanInput"
              accept=".pdf,.jpg,.png"
              @change="handleScanUpload"
            />
          </div>
          <table class="table table-striped table-hover custom-table">
            <thead>
              <tr>
                <th>Référence</th>
                <th>Destinataire</th>
                <th>Objet</th>
                <th>Date</th>
                <th>Fonction</th>
                <th>Type de document</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="corresp in paginatedCorrespondances" :key="corresp.id">
                <td>{{ corresp.reference || 'N/A' }}</td>
                <td>{{ corresp.destinataire || 'N/A' }}</td>
                <td>{{ corresp.objet || 'N/A' }}</td>
                <td>{{ corresp.date || 'N/A' }}</td>
                <td>{{ corresp.fonction || 'N/A' }}</td>
                <td>{{ corresp.type_document || 'N/A' }}</td>
                <td class="d-flex align-items-center">
                  <button @click="viewCorrespondance(corresp)" class="btn btn-info btn-sm custom-btn icon-btn me-2" title="Visualiser">
                    <i class="cil-eye"></i>
                  </button>
                  <button @click="shareCorrespondance(corresp)" class="btn btn-warning btn-sm custom-btn icon-btn me-2" title="Partager">
                    <i class="cil-share"></i>
                  </button>
                  <button @click="deleteCorrespondance(corresp.id)" class="btn btn-danger btn-sm custom-btn icon-btn" title="Supprimer">
                    <i class="cil-trash"></i>
                  </button>
                </td>
              </tr>
              <tr v-if="paginatedCorrespondances.length === 0">
                <td colspan="7" class="text-center">Aucune correspondance interne enregistrée</td>
              </tr>
            </tbody>
          </table>
          <!-- Pagination -->
          <div class="d-flex justify-content-center mt-3">
            <nav>
              <ul class="pagination">
                <li class="page-item" :class="{ disabled: currentPage === 1 }">
                  <button class="page-link" @click="currentPage--" :disabled="currentPage === 1">Précédent</button>
                </li>
                <li class="page-item" v-for="page in totalPages" :key="page" :class="{ active: currentPage === page }">
                  <button class="page-link" @click="currentPage = page">{{ page }}</button>
                </li>
                <li class="page-item" :class="{ disabled: currentPage === totalPages }">
                  <button class="page-link" @click="currentPage++" :disabled="currentPage === totalPages">Suivant</button>
                </li>
              </ul>
            </nav>
          </div>
        </CCardBody>
      </CCard>
    </CCol>

    <!-- Modal pour ajouter une correspondance -->
    <CModal :visible="showAddModal" title="Ajouter une Correspondance Interne" @close="showAddModal = false" class="custom-modal">
      <CRow>
        <!-- Colonne gauche : Référence, Destinataire, Objet -->
        <CCol :xs="6">
          <form @submit.prevent="submitCorrespondance">
            <div class="mb-3">
              <label for="reference" class="form-label"><i class="cil-tags me-1"></i> Référence</label>
              <input
                v-model="correspondance.reference"
                type="text"
                class="form-control outlook-input"
                id="reference"
                placeholder="Référence de la correspondance"
                required
              />
            </div>
            <div class="mb-3">
              <label for="destinataire" class="form-label"><i class="cil-user me-1"></i> Destinataire</label>
              <input
                v-model="correspondance.destinataire"
                type="text"
                class="form-control outlook-input"
                id="destinataire"
                placeholder="Nom du destinataire"
                required
              />
            </div>
            <div class="mb-3">
              <label for="objet" class="form-label"><i class="cil-pencil me-1"></i> Objet</label>
              <textarea
                v-model="correspondance.objet"
                class="form-control outlook-textarea"
                id="objet"
                rows="3"
                placeholder="Objet de la correspondance"
                required
              ></textarea>
            </div>
          </form>
        </CCol>
        <!-- Colonne droite : Date, Fonction, Type de document, Pièce jointe -->
        <CCol :xs="6">
          <div class="mb-3">
            <label for="date" class="form-label"><i class="cil-calendar me-1"></i> Date</label>
            <input
              v-model="correspondance.date"
              type="date"
              class="form-control outlook-input"
              id="date"
              required
            />
          </div>
          <div class="mb-3">
            <label for="fonction" class="form-label"><i class="cil-briefcase me-1"></i> Fonction</label>
            <input
              v-model="correspondance.fonction"
              type="text"
              class="form-control outlook-input"
              id="fonction"
              placeholder="Fonction du destinataire (ex: Comptable)"
            />
          </div>
          <div class="mb-3">
            <label for="type_document" class="form-label"><i class="cil-file me-1"></i> Type de document</label>
            <select
              v-model="correspondance.type_document"
              class="form-control outlook-input"
              id="type_document"
              required
            >
              <option value="" disabled>Sélectionnez un type</option>
              <option value="Lettre">Lettre</option>
              <option value="Document légal">Document légal</option>
              <option value="Facture">Facture</option>
              <option value="Autre">Autre</option>
            </select>
            <input
              v-if="correspondance.type_document === 'Autre'"
              v-model="correspondance.type_document_autre"
              type="text"
              class="form-control outlook-input mt-2"
              id="type_document_autre"
              placeholder="Précisez le type de document"
              required
            />
          </div>
          <div class="mb-3">
            <label for="pieceJointe" class="form-label"><i class="cil-paperclip me-1"></i> Pièce Jointe</label>
            <input
              @change="handleFileUpload"
              type="file"
              class="form-control outlook-input"
              id="pieceJointe"
              accept=".pdf,.doc,.docx,.jpg,.png"
              ref="fileInput"
            />
          </div>
        </CCol>
      </CRow>
      <template #footer>
        <button @click="showAddModal = false" class="btn btn-secondary custom-btn me-2">Annuler</button>
        <button
          @click="submitCorrespondance"
          class="btn btn-primary custom-btn"
          :disabled="!correspondance.reference || !correspondance.destinataire || !correspondance.objet || !correspondance.date || !correspondance.type_document || (correspondance.type_document === 'Autre' && !correspondance.type_document_autre)"
        >
          <i class="cil-check me-1"></i> Valider
        </button>
      </template>
    </CModal>

    <!-- Modal pour visualiser les détails -->
    <CModal :visible="showDetailsModal" title="Détails de la Correspondance" @close="showDetailsModal = false" class="custom-modal">
      <p><strong>Référence :</strong> {{ selectedCorrespondance.reference || 'N/A' }}</p>
      <p><strong>Destinataire :</strong> {{ selectedCorrespondance.destinataire || 'N/A' }}</p>
      <p><strong>Objet :</strong> {{ selectedCorrespondance.objet || 'N/A' }}</p>
      <p><strong>Date :</strong> {{ selectedCorrespondance.date || 'N/A' }}</p>
      <p><strong>Fonction :</strong> {{ selectedCorrespondance.fonction || 'N/A' }}</p>
      <p><strong>Type de document :</strong> {{ selectedCorrespondance.type_document || 'N/A' }}</p>
      <p v-if="selectedCorrespondance.piece_jointe">
        <strong>Pièce jointe :</strong>
        <a :href="`http://localhost:3000${selectedCorrespondance.piece_jointe}`" target="_blank" class="text-primary">Télécharger</a>
      </p>
      <button @click="showDetailsModal = false" class="btn btn-secondary custom-btn">Fermer</button>
    </CModal>
  </CRow>
</template>

<script>
import * as XLSX from 'xlsx';

export default {
  data() {
    return {
      correspondance: {
        reference: '',
        destinataire: '',
        objet: '',
        date: '',
        fonction: '',
        type_document: '',
        type_document_autre: '',
      },
      pieceJointe: null,
      correspondances: [],
      showAddModal: false,
      showDetailsModal: false,
      selectedCorrespondance: {},
      currentPage: 1,
      itemsPerPage: 5,
    };
  },
  computed: {
    paginatedCorrespondances() {
      const start = (this.currentPage - 1) * this.itemsPerPage;
      const end = start + this.itemsPerPage;
      return this.correspondances.slice(start, end);
    },
    totalPages() {
      return Math.ceil(this.correspondances.length / this.itemsPerPage);
    },
  },
  methods: {
    async fetchCorrespondances() {
      console.log('Récupération des correspondances internes...');
      try {
        const response = await fetch('http://localhost:3000/api/correspondances-internes');
        if (!response.ok) {
          throw new Error(`Erreur HTTP ${response.status}: ${response.statusText}`);
        }
        const data = await response.json();
        console.log('Correspondances reçues :', data);
        this.correspondances = data;
        this.currentPage = 1;
      } catch (error) {
        console.error('Erreur lors de la récupération des correspondances :', error);
        alert(`Erreur lors de la récupération des correspondances : ${error.message}. Vérifiez que le serveur backend est en cours d'exécution sur http://localhost:3000.`);
      }
    },
    async submitCorrespondance() {
      if (!this.correspondance.reference || !this.correspondance.destinataire || !this.correspondance.objet || !this.correspondance.date || !this.correspondance.type_document) {
        alert('Veuillez remplir tous les champs requis');
        return;
      }
      if (this.correspondance.type_document === 'Autre' && !this.correspondance.type_document_autre) {
        alert('Veuillez préciser le type de document pour "Autre"');
        return;
      }

      console.log('Validation de la correspondance :', this.correspondance);
      console.log('Pièce jointe :', this.pieceJointe);

      const formData = new FormData();
      formData.append('reference', this.correspondance.reference);
      formData.append('destinataire', this.correspondance.destinataire);
      formData.append('objet', this.correspondance.objet);
      formData.append('date', this.correspondance.date);
      formData.append('fonction', this.correspondance.fonction || '');
      formData.append('type_document', this.correspondance.type_document === 'Autre' ? this.correspondance.type_document_autre : this.correspondance.type_document);
      if (this.pieceJointe) {
        formData.append('pieceJointe', this.pieceJointe);
      }

      try {
        const response = await fetch('http://localhost:3000/api/correspondances-internes', {
          method: 'POST',
          body: formData,
        });
        if (response.ok) {
          alert('Correspondance interne validée et enregistrée avec succès !');
          this.resetForm();
          this.showAddModal = false;
          await this.fetchCorrespondances();
        } else {
          const errorData = await response.json();
          alert(`Erreur : ${errorData.error || 'Échec de la validation de la correspondance'}`);
        }
      } catch (error) {
        console.error('Erreur lors de la validation de la correspondance :', error);
        alert(`Erreur lors de la validation de la correspondance : ${error.message}`);
      }
    },
    handleFileUpload(event) {
      const file = event.target.files[0];
      if (file) {
        const allowedTypes = [
          'application/pdf',
          'application/msword',
          'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
          'image/jpeg',
          'image/png',
        ];
        if (!allowedTypes.includes(file.type)) {
          alert('Type de fichier non supporté. Utilisez .pdf, .doc, .docx, .jpg ou .png');
          this.pieceJointe = null;
          this.$refs.fileInput.value = '';
          return;
        }
        if (file.size > 5 * 1024 * 1024) {
          alert('Le fichier est trop volumineux. La taille maximale est de 5 Mo.');
          this.pieceJointe = null;
          this.$refs.fileInput.value = '';
          return;
        }
        this.pieceJointe = file;
      } else {
        this.pieceJointe = null;
      }
    },
    async importFromExcel(event) {
      const file = event.target.files[0];
      if (!file) return;

      const allowedTypes = [
        'application/vnd.ms-excel',
        'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
        'text/csv',
      ];
      if (!allowedTypes.includes(file.type)) {
        alert('Type de fichier non supporté. Utilisez .xlsx, .xls ou .csv');
        this.$refs.importInput.value = '';
        return;
      }

      try {
        const reader = new FileReader();
        reader.onload = async (e) => {
          const data = new Uint8Array(e.target.result);
          const workbook = XLSX.read(data, { type: 'array' });
          const sheet = workbook.Sheets[workbook.SheetNames[0]];
          const json = XLSX.utils.sheet_to_json(sheet);

          const correspondances = json.map((row) => ({
            reference: row['Référence']?.toString() || '',
            destinataire: row['Destinataire']?.toString() || '',
            objet: row['Objet']?.toString() || '',
            date: row['Date']?.toString() || '',
            fonction: row['Fonction']?.toString() || '',
            type_document: row['Type de document']?.toString() || '',
          }));

          const validCorrespondances = correspondances.filter(
            (c) => c.reference && c.destinataire && c.objet && c.date && c.type_document
          );

          if (validCorrespondances.length === 0) {
            alert('Aucune correspondance valide trouvée dans le fichier Excel');
            return;
          }

          try {
            const response = await fetch('http://localhost:3000/api/correspondances-internes/bulk', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify(validCorrespondances),
            });
            if (response.ok) {
              alert('Correspondances importées avec succès !');
              this.$refs.importInput.value = '';
              await this.fetchCorrespondances();
            } else {
              const errorData = await response.json();
              alert(`Erreur : ${errorData.error || 'Échec de l’importation des correspondances'}`);
            }
          } catch (error) {
            console.error('Erreur lors de l’importation :', error);
            alert(`Erreur lors de l’importation : ${error.message}`);
          }
        };
        reader.readAsArrayBuffer(file);
      } catch (error) {
        console.error('Erreur lors de la lecture du fichier Excel :', error);
        alert('Erreur lors de la lecture du fichier Excel');
      }
    },
    exportToExcel() {
      if (this.correspondances.length === 0) {
        alert('Aucune correspondance à exporter');
        return;
      }

      const data = this.correspondances.map((c) => ({
        Référence: c.reference,
        Destinataire: c.destinataire,
        Objet: c.objet,
        Date: c.date,
        Fonction: c.fonction || 'N/A',
        'Type de document': c.type_document,
        'Pièce jointe': c.piece_jointe || 'Aucune',
      }));

      const worksheet = XLSX.utils.json_to_sheet(data);
      const workbook = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(workbook, worksheet, 'Correspondances');
      XLSX.write_file(workbook, 'correspondances_internes.xlsx');
    },
    printTable() {
      const printContent = `
        <html>
          <head>
            <title>Impression des Correspondances Internes</title>
            <style>
              table { width: 100%; border-collapse: collapse; }
              th, td { border: 1px solid #ddd; padding: 8px; text-align: left; }
              th { background-color: #f3f2f1; }
            </style>
          </head>
          <body>
            <h2>Liste des Correspondances Internes</h2>
            <table>
              <thead>
                <tr>
                  <th>Référence</th>
                  <th>Destinataire</th>
                  <th>Objet</th>
                  <th>Date</th>
                  <th>Fonction</th>
                  <th>Type de document</th>
                </tr>
              </thead>
              <tbody>
                ${this.correspondances
                  .map(
                    (c) => `
                      <tr>
                        <td>${c.reference || 'N/A'}</td>
                        <td>${c.destinataire || 'N/A'}</td>
                        <td>${c.objet || 'N/A'}</td>
                        <td>${c.date || 'N/A'}</td>
                        <td>${c.fonction || 'N/A'}</td>
                        <td>${c.type_document || 'N/A'}</td>
                      </tr>
                    `
                  )
                  .join('')}
              </tbody>
            </table>
          </body>
        </html>
      `;
      const printWindow = window.open('', '_blank');
      printWindow.document.write(printContent);
      printWindow.document.close();
      printWindow.print();
    },
    async handleScanUpload(event) {
      const file = event.target.files[0];
      if (!file) return;

      const allowedTypes = ['application/pdf', 'image/jpeg', 'image/png'];
      if (!allowedTypes.includes(file.type)) {
        alert('Type de fichier non supporté. Utilisez .pdf, .jpg ou .png');
        this.$refs.scanInput.value = '';
        return;
      }
      if (file.size > 5 * 1024 * 1024) {
        alert('Le fichier est trop volumineux. La taille maximale est de 5 Mo.');
        this.$refs.scanInput.value = '';
        return;
      }

      const formData = new FormData();
      formData.append('reference', `SCAN-${Date.now()}`);
      formData.append('destinataire', 'Scanné');
      formData.append('objet', 'Document scanné');
      formData.append('date', new Date().toISOString().split('T')[0]);
      formData.append('fonction', 'N/A');
      formData.append('type_document', 'Document scanné');
      formData.append('pieceJointe', file);

      try {
        const response = await fetch('http://localhost:3000/api/correspondances-internes', {
          method: 'POST',
          body: formData,
        });
        if (response.ok) {
          alert('Document scanné enregistré avec succès !');
          this.$refs.scanInput.value = '';
          await this.fetchCorrespondances();
        } else {
          const errorData = await response.json();
          alert(`Erreur : ${errorData.error || 'Échec de l’enregistrement du scan'}`);
        }
      } catch (error) {
        console.error('Erreur lors de l’enregistrement du scan :', error);
        alert(`Erreur lors de l’enregistrement du scan : ${error.message}`);
      }
    },
    shareCorrespondance(corresp) {
      const text = `Correspondance Interne\nRéférence: ${corresp.reference}\nDestinataire: ${corresp.destinataire}\nObjet: ${corresp.objet}\nDate: ${corresp.date}\nFonction: ${corresp.fonction || 'N/A'}\nType de document: ${corresp.type_document}\nPièce jointe: ${corresp.piece_jointe || 'Aucune'}`;
      navigator.clipboard.writeText(text).then(() => {
        alert('Détails de la correspondance copiés dans le presse-papiers !');
      }).catch((error) => {
        console.error('Erreur lors de la copie :', error);
        alert('Erreur lors de la copie dans le presse-papiers');
      });
    },
    viewCorrespondance(corresp) {
      console.log('Affichage des détails de la correspondance :', corresp);
      this.selectedCorrespondance = { ...corresp };
      this.showDetailsModal = true;
    },
    async deleteCorrespondance(id) {
      console.log('Suppression de la correspondance ID :', id);
      try {
        const response = await fetch(`http://localhost:3000/api/correspondances-internes/${id}`, {
          method: 'DELETE',
        });
        if (response.ok) {
          alert('Correspondance supprimée avec succès !');
          await this.fetchCorrespondances();
        } else {
          const errorData = await response.json();
          alert(`Erreur : ${errorData.error || 'Échec de la suppression de la correspondance'}`);
        }
      } catch (error) {
        console.error('Erreur lors de la suppression de la correspondance :', error);
        alert(`Erreur lors de la suppression de la correspondance : ${error.message}`);
      }
    },
    resetForm() {
      this.correspondance = {
        reference: '',
        destinataire: '',
        objet: '',
        date: '',
        fonction: '',
        type_document: '',
        type_document_autre: '',
      };
      this.pieceJointe = null;
      this.$refs.fileInput.value = '';
    },
  },
  mounted() {
    this.fetchCorrespondances();
  },
};
</script>

<style scoped>
/* Style général inspiré d'Outlook */
.text-center {
  text-align: center;
}
.outlook-card {
  border-radius: 8px;
  background-color: #ffffff;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}
.outlook-header {
  background-color: #0078d4;
  color: white;
  border-top-left-radius: 8px;
  border-top-right-radius: 8px;
  padding: 12px 16px;
  font-weight: 600;
}

/* Barre d'outils */
.outlook-toolbar {
  background-color: #f3f2f1;
  border-bottom: 1px solid #e1dfdd;
  padding: 8px 16px;
}

/* Boutons icônes uniquement */
.icon-btn {
  padding: 6px 10px;
  font-size: 16px;
  line-height: 1;
  width: 36px;
  height: 36px;
  display: flex;
  align-items: center;
  justify-content: center;
}

/* Formulaire */
.outlook-input,
.outlook-textarea {
  border: 1px solid #d1d1d1;
  border-radius: 4px;
  padding: 8px 12px;
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
  transition: border-color 0.2s ease, box-shadow 0.2s ease;
}
.outlook-input:focus,
.outlook-textarea:focus {
  border-color: #0078d4;
  box-shadow: 0 0 5px rgba(0, 120, 212, 0.3);
  outline: none;
}
.outlook-textarea {
  resize: vertical;
  min-height: 80px;
}
.form-label {
  font-weight: 500;
  color: #333;
  font-size: 14px;
}

/* Tableau */
.custom-table {
  border-collapse: separate;
  border-spacing: 0;
  border-radius: 8px;
  overflow: hidden;
}
.custom-table th,
.custom-table td {
  padding: 12px 15px;
  vertical-align: middle;
}
.custom-table th {
  background-color: #f3f2f1;
  font-weight: 600;
  color: #333;
}
.custom-table tr:hover {
  background-color: #e1dfdd;
}

/* Pagination */
.pagination {
  margin: 0;
}
.page-item .page-link {
  border-radius: 4px;
  margin: 0 4px;
  color: #0078d4;
  border: 1px solid #d1d1d1;
  transition: background-color 0.2s ease, color 0.2s ease;
}
.page-item.active .page-link {
  background-color: #0078d4;
  color: white;
  border-color: #0078d4;
}
.page-item.disabled .page-link {
  color: #a0a0a0;
  cursor: not-allowed;
}
.page-item .page-link:hover:not(.disabled) {
  background-color: #e6f0fa;
}

/* Boutons */
.custom-btn {
  border-radius: 4px;
  padding: 8px 12px;
  font-size: 14px;
  transition: background-color 0.2s ease, transform 0.2s ease, box-shadow 0.2s ease;
}
.custom-btn:hover {
  transform: scale(1.05);
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}
.btn-primary {
  background-color: #0078d4;
  border-color: #0078d4;
}
.btn-primary:hover {
  background-color: #005a9e;
  border-color: #005a9e;
}
.btn-outline-primary {
  border-color: #0078d4;
  color: #0078d4;
}
.btn-outline-primary:hover {
  background-color: #e6f0fa;
  border-color: #005a9e;
}
.btn-info {
  background-color: #17a2b8;
  border-color: #17a2b8;
}
.btn-info:hover {
  background-color: #138496;
  border-color: #138496;
}
.btn-warning {
  background-color: #ffc107;
  border-color: #ffc107;
}
.btn-warning:hover {
  background-color: #e0a800;
  border-color: #e0a800;
}
.btn-danger {
  background-color: #dc3545;
  border-color: #dc3545;
}
.btn-danger:hover {
  background-color: #c82333;
  border-color: #c82333;
}
.btn-secondary {
  background-color: #8e8e8e;
  border-color: #8e8e8e;
}
.btn-secondary:hover {
  background-color: #707070;
  border-color: #707070;
}
.btn-primary:disabled {
  background-color: #a0a0a0;
  border-color: #a0a0a0;
  cursor: not-allowed;
}

/* Modal */
.custom-modal .modal-content {
  border-radius: 8px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
  background-color: #ffffff;
}
.custom-modal .modal-header {
  background-color: #0078d4;
  color: white;
  border-top-left-radius: 8px;
  border-top-right-radius: 8px;
  padding: 12px 16px;
  border-bottom: none;
}
.custom-modal .modal-title {
  font-weight: 600;
  font-size: 16px;
}
.custom-modal .modal-body {
  padding: 16px;
  color: #333;
}
.custom-modal .modal-body p {
  margin-bottom: 10px;
  font-size: 14px;
}
.custom-modal .modal-footer {
  border-top: none;
  padding: 0 16px 16px;
  justify-content: flex-end;
}

/* Animation pour le modal */
@keyframes fadeInScale {
  from {
    opacity: 0;
    transform: scale(0.9);
  }
  to {
    opacity: 1;
    transform: scale(1);
  }
}
.custom-modal .modal-dialog {
  animation: fadeInScale 0.3s ease;
  max-width: 600px;
}

/* Lien de téléchargement */
.text-primary {
  color: #0078d4 !important;
  text-decoration: none;
  transition: color 0.2s ease;
}
.text-primary:hover {
  color: #005a9e !important;
  text-decoration: underline;
}
</style>