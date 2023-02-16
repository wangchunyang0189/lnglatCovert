<template>
  <div id="app">
    <Covert></Covert>
  </div>
</template>

<script>
import Covert from './components/Covert.vue';

export default {
  name: 'App',
  components: {
    Covert
  }
};
</script>

<style>
#app {
  font-family: Avenir, Helvetica, Arial, sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  text-align: center;
  color: #2c3e50;
  margin-top: 60px;
}
</style>
