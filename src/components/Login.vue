<template>
  <div>
    <v-container class="grey lighten-5">
      <v-row no-gutters align="center" justify="center">
        <v-col cols="12" sm="4">
          <v-card class="pa-2" outlined tile>
            <v-form @submit.prevent="validar" ref="form">
              <v-container>
                <v-row>
                  <v-col>
                    <v-text-field
                      v-model="form.email"
                      :counter="10"
                      label="Usuario"
                      :rules="validation.emailRules"
                    ></v-text-field>
                  </v-col>
                  <v-col cols="12">
                    <v-text-field
                      v-model="form.password"
                      :counter="10"
                      label="Contraseña"
                      required
                      type="password"
                      :rules="validation.nameRules"
                    ></v-text-field>
                  </v-col>
                  <v-col>
                    <v-btn type="submit" color="success" class="mr-4">Enviar</v-btn>
                  </v-col>
                </v-row>
              </v-container>
            </v-form>
          </v-card>
        </v-col>
      </v-row>
    </v-container>
  </div>
</template>

<script>
import axios from "axios";
export default {
  name: "HelloWorld",

  data: () => ({
    form: { user: null, pass: null },
    validation: {
      valid: true,
      nameRules: [
        v => !!v || "Name is required",
        v => (v && v.length <= 6) || "Debe ser menos de 7 de caracteres"
      ],
      emailRules: [
        v => !!v || "E-mail is required",
        v => /.+@.+\..+/.test(v) || "El usuario debe ser un mail válido"
      ]
    }
  }),
  methods: {
    validar() {
      if (this.$refs.form.validate()) {
        this.getLogin();
      }
    },
    async getLogin() {
      localStorage.removeItem("token");
      const header = {
        headers: {
          Accept: "application/json"
        }
      };
      let rs = {};
      try {
          rs = await axios.post("http://localhost/api/auth/login",this.form,header)  
      } catch (error) {
          console.log(error);
      }
      if (rs.status == 200) {
        console.log(rs);
        localStorage.setItem("token", rs.data.access_token);
        this.$router.push({ name: 'Servidores' })
      }
    }
  }
};
</script>
