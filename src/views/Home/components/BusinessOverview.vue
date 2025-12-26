<template>
  <div>
    <contractionList @getContraction=handleContractionData></contractionList>
    <ContractionStatus></ContractionStatus>
  </div>
</template>
<script setup>
import contractionList from '@/components/businessComponents/ContractionList.vue';
import ContractionStatus from '@/components/businessComponents/ContractionStatus.vue';

const handleContractionData = ( contractionData ) => {
  console.log(contractionData);
  
}

</script>
<style scoped></style>