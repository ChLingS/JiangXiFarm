<template>
  <div>
    <ContractionList @getContraction=handleContractionData></ContractionList>
    <ContractionStatus></ContractionStatus>
    <AreaSelect></AreaSelect>
  </div>
</template>
<script setup>
import ContractionList from '@/components/businessComponents/ContractionList.vue';
import ContractionStatus from '@/components/businessComponents/ContractionStatus.vue';
import AreaSelect from '@/components/businessComponents/AreaSelect.vue';

const handleContractionData = (contractionData) => {
  console.log(contractionData);

}

</script>
<style scoped></style>
