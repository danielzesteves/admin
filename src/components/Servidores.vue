<template>
  <v-container>
    <v-data-table :headers="headers" :items="items" sort-by="calories" class="elevation-1">
      <template v-slot:body="{ items }">
        <tbody>
          <tr v-for="item in items" :key="item.name">
            <td>
              <v-icon small class="handle">mdi-arrow-split-horizontal</v-icon>
            </td>
            <td>{{ item.id }}</td>
            <td>{{ item.ip }}</td>
            <td>{{ item.host }}</td>
            <td>{{ item.descripcion }}</td>
            <td>
              <v-btn icon color="blue">
                <v-icon small>mdi-pencil</v-icon>
              </v-btn>
              <v-btn icon color="red">
                <v-icon small>mdi-delete</v-icon>
              </v-btn>
            </td>
          </tr>
        </tbody>
      </template>
      <template v-slot:top>
        <v-toolbar flat color="white">
          <v-toolbar-title>Servidores</v-toolbar-title>
          <v-divider class="mx-4" inset vertical></v-divider>
          <v-spacer></v-spacer>
          <v-dialog v-model="dialog" max-width="500px">
            <template v-slot:activator="{ on }">
              <v-btn color="primary" dark class="mb-2" v-on="on" fab small>
                <v-icon small>mdi-plus</v-icon>
              </v-btn>
            </template>
            <v-card>
              <v-card-title>
                <span class="headline">Servidor</span>
              </v-card-title>

              <v-card-text>
                <v-container>
                  <v-row>
                    <v-col cols="12" sm="6" md="6">
                      <v-text-field
                        v-model="form.ip"
                        label="IP"
                        v-validate="'required|ip'"
                        :error="errors.has('ip')"
                        name="ip"
                        :error-messages="errors.first('ip')"
                      ></v-text-field>
                    </v-col>
                    <v-col cols="12" sm="6" md="6">
                      <v-text-field
                        v-model="form.host"
                        label="Host"
                        v-validate="'required'"
                        :error="errors.has('host')"
                        name="host"
                        :error-messages="errors.first('host')"
                      ></v-text-field>
                    </v-col>
                    <v-col cols="12" sm="12" md="12">
                      <input type="file" id="files" ref="files"  @change="handleFilesUpload"/>
                    </v-col>
                    <v-col cols="12" sm="6" md="12">
                      <v-text-field
                        v-model="form.descripcion"
                        label="Descripción"
                        v-validate="'required|max:200'"
                        :error="errors.has('descripcion')"
                        name="descripcion"
                        :error-messages="errors.first('descripcion')"
                        counter
                      ></v-text-field>
                    </v-col>
                  </v-row>
                </v-container>
              </v-card-text>
              <v-card-actions>
                <v-spacer></v-spacer>
                <v-btn color="blue darken-1" text @click="close">Cerrar</v-btn>
                <v-btn color="blue darken-1" text @click="validar">Guardar</v-btn>
              </v-card-actions>
            </v-card>
          </v-dialog>
        </v-toolbar>
      </template>

      <template v-slot:item.actions="{ item }">
        <v-icon small class="mr-2" @click="editItem(item)">mdi-pencil</v-icon>
        <v-icon small @click="deleteItem(item)">mdi-delete</v-icon>
      </template>
    </v-data-table>
  </v-container>
</template>

<script>
import axios from "axios";
import Sortable from "sortablejs";
export default {
  name: "HelloWorld",

  data: () => ({
    dialog: false,
    headers: [
      {
        text: "Ordenar",
        align: "center",
        sortable: false
      },
      {
        text: "ID",
        align: "center",
        sortable: true,
        value: "id"
      },
      { text: "IP", value: "ip", align: "center", sortable: false },
      { text: "Host", value: "host", align: "center", sortable: false },
      {
        text: "Descripcion",
        value: "descripcion",
        align: "center",
        sortable: false
      },
      { text: "Acciones", value: "actions", sortable: false }
    ],
    items: [],
    form: {}
  }),
  mounted() {
    this.getServidores();
  },
  methods: {
    close() {
      this.dialog = false;
    },
    validar() {
      this.$validator.validateAll().then(result => {
        if (result) {
          this.guardar();
        }
      });
    },
    async getServidores() {
      let res = await axios.get("http://localhost/api/servidores");
      console.log(JSON.parse(JSON.stringify(res)));
      this.items = res.data;
      this.setSortable();
    },
    setSortable() {
      let table = document.querySelector(".v-data-table tbody");
      const _self = this;
      Sortable.create(table, {
        handle: ".handle",
        onEnd({ newIndex, oldIndex }) {
          const rowSelected = _self.items.splice(oldIndex, 1)[0];
          _self.items.splice(newIndex, 0, rowSelected);
        }
      });
    },
    async guardar() {
        console.log(this.form.file);
        let formData = new FormData();
        formData.append('file', this.form.file);
        formData.append('ip', this.form.ip);
        formData.append('host', this.form.host);
        formData.append('descripcion', this.form.descripcion);
        const header = {headers: {"Accept":"application/json","Access-Control-Allow-Origin":"*",'Content-Type': 'multipart/form-data'}};
        const rs = await axios.post("http://localhost/api/servidores", formData,header);
        console.log(rs);
        // this.dialog = false;
    },
    handleFilesUpload(){
      
    this.form.file = this.$refs.files.files[0];
  }
  }
};
</script>
