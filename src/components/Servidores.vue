<template>
  <v-container>
    <v-btn depressed small color="primary" class="mb-2" @click="salir">Salir</v-btn>
    <v-data-table
      :headers="headers"
      :items="items"
      sort-by="calories"
      class="elevation-1"
    >
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
              <a :href="item.img" target="_blank">Ver</a>
            </td>
            <td>
              <v-icon small @click="toEdit(item)">mdi-pencil</v-icon>
              <v-icon small @click="borrar(item.id)" color="red"
                >mdi-delete</v-icon
              >
            </td>
          </tr>
        </tbody>
      </template>
      <template v-slot:top>
        <v-toolbar flat color="white">
          <v-toolbar-title>{{ cantidad }} servidores</v-toolbar-title>
          <v-divider class="mx-4" inset vertical></v-divider>
          <v-spacer></v-spacer>
          <v-btn color="primary" dark class="mb-2" fab small @click="toCrear">
            <v-icon small>mdi-plus</v-icon>
          </v-btn>
          <v-dialog v-model="dialog" max-width="500px">
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
                    <v-col cols="12" sm="12" md="12" v-if="!crear">
                      <v-switch
                        v-model="inputFile"
                        :label="`Cargar imagen:`"
                      ></v-switch>
                    </v-col>
                    <v-col cols="12" sm="12" md="12" v-if="crear || inputFile">
                      <input
                        type="file"
                        id="files"
                        ref="files"
                        @change="handleFilesUpload"
                        v-validate="'required|ext:jpeg,jpg,png,gif'"
                        name="files"
                        data-vv-as="archivo"
                      />
                    </v-col>
                    <v-col cols="12" sm="12" md="12" v-else>
                      Url: {{ form.img }}
                    </v-col>
                    <v-col cols="12" sm="12" md="12">
                      <span v-if="errors.has('files')">{{
                        errors.first("files")
                      }}</span>
                    </v-col>
                  </v-row>
                </v-container>
              </v-card-text>
              <v-card-actions>
                <v-spacer></v-spacer>
                <v-btn color="blue darken-1" text @click="close">Cerrar</v-btn>
                <v-btn color="blue darken-1" text @click="validar"
                  >Guardar</v-btn
                >
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
    <v-snackbar
      v-model="alertSnack.visible"
      :top="true"
      :color="alertSnack.color"
      dense
    >
      {{ alertSnack.text }}
      <v-btn text @click="alertSnack.visible = false">Cerrar</v-btn>
    </v-snackbar>
    <v-dialog v-model="confirmar" max-width="480">
      <v-card>
        <v-card-title class="headline"
          >¿Realmente desea borrar el servidor?</v-card-title
        >
        <v-card-actions>
          <v-spacer></v-spacer>

          <v-btn color="green darken-1" text @click="confirmar = false"
            >Cancelar</v-btn
          >

          <v-btn color="green darken-1" text @click="doBorrar">Confirmar</v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>
  </v-container>
</template>

<script>
import axios from "axios";
import Sortable from "sortablejs";
export default {
  name: "HelloWorld",

  data: () => ({
    confirmar: false,
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
      {
        text: "Imagen",
        value: "img",
        align: "center",
        sortable: false
      },
      { text: "Acciones", value: "actions", sortable: false }
    ],
    items: [],
    form: {},
    alertSnack: { visible: false, mensaje: null, color: null },
    idBorrar: null,
    crear: false,
    inputFile: true
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
          this.sentTo();
        }
      });
    },
    sentTo() {
      if (this.crear) {
        return this.guardar();
      }
      this.editar();
    },
    async getServidores() {
      let res = await axios.get("http://localhost/api/servidores");
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
      let formData = new FormData();
      formData.append("file", this.form.file);
      formData.append("ip", this.form.ip);
      formData.append("host", this.form.host);
      formData.append("descripcion", this.form.descripcion);
      const header = {
        headers: {
          Accept: "application/json",
          "Access-Control-Allow-Origin": "*",
          "Content-Type": "multipart/form-data"
        }
      };
      let rs = null;
      try {
        rs = await axios.post(
          "http://localhost/api/servidores",
          formData,
          header
        );
        console.log(rs);
        this.items = rs.data;
      } catch (error) {
        rs = { status: 500 };
      }

      if (rs.status === 200) {
        this.setAlert("success", "Servidor creado", true);
        this.dialog = false;
      }
      if (rs.status != 200) {
        this.setAlert("error", "Ocurrio un error al crear el servidor", true);
      }
    },
    handleFilesUpload() {
      this.form.file = this.$refs.files.files[0];
    },
    setAlert(color, text, visible = false) {
      this.alertSnack = { visible: visible, text: text, color: color };
    },
    borrar(id) {
      this.idBorrar = id;
      this.confirmar = true;
    },
    async doBorrar() {
      const header = {
        headers: {
          Accept: "application/json",
          "Access-Control-Allow-Origin": "*",
          "Content-Type": "multipart/form-data"
        }
      };
      let rs = null;
      try {
        rs = await axios.delete(
          `http://localhost/api/servidores/${this.idBorrar}`,
          header
        );
        this.items = rs.data;
      } catch (error) {
        rs = { status: 500 };
      }

      if (rs.status === 200) {
        this.setAlert("success", "Servidor borrado", true);
        this.dialog = false;
      }
      if (rs.status != 200) {
        this.setAlert("error", "Ocurrio un error al borrar el servidor", true);
      }
      this.confirmar = false;
    },
    toEdit(servidor) {
      this.inputFile = false;
      this.form = JSON.parse(JSON.stringify(servidor));
      this.dialog = true;
      this.crear = false;
    },
    async editar() {
      let formData = new FormData();
      formData.append("file", this.form.file);
      formData.append("ip", this.form.ip);
      formData.append("host", this.form.host);
      formData.append("descripcion", this.form.descripcion);
      formData.append("_method", "put");
      const header = {
        headers: {
          Accept: "application/json",
          "Access-Control-Allow-Origin": "*",
          "Content-Type": "multipart/form-data"
        }
      };
      let rs = null;
      try {
        rs = await axios.post(
          `http://localhost/api/servidores/${this.form.id}`,
          formData,
          header
        );
        console.log(rs);
        this.items = rs.data;
      } catch (error) {
        rs = { status: 500 };
      }

      if (rs.status === 200) {
        this.setAlert("success", "Servidor modificado", true);
        this.dialog = false;
      }
      if (rs.status != 200) {
        this.setAlert("error", "Ocurrio un error al modificar el servidor", true);
      }
    },
    toCrear() {
      this.form = {};
      this.inputFile = true;
      this.dialog = true;
      this.crear = true;
    },
    salir(){
      localStorage.removeItem("token");
      this.$router.push({ name: 'Login' })
    }
  },
  computed: {
    // a computed getter
    cantidad: function() {
      const cantidad = this.items.length;
      // `this` points to the vm instance
      return cantidad;
    }
  }
};
</script>
