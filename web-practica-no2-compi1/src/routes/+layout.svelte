<script>
	import favicon from '$lib/assets/favicon.svg';
	import 'bootstrap/dist/css/bootstrap.min.css';
	import 'bootstrap-icons/font/bootstrap-icons.css';

	let { children } = $props();
</script>

<svelte:head>
	<title>Wison Compiler LL</title>
	<link rel="icon" href={favicon} />
</svelte:head>



<main class="container">
    {@render children()}
</main>

<style>
    :global(body) {
        background-color: #0f172a; 
        color: #f8fafc;
        min-height: 100vh;
        font-family: 'Inter', system-ui, -apple-system, sans-serif;
    }

    :global(.navbar) {
        background-color: #1e293b !important;
        border-bottom: 1px solid #334155;
    }

    :global(::-webkit-scrollbar) {
        width: 8px;
    }
    :global(::-webkit-scrollbar-track) {
        background: #0f172a;
    }
    :global(::-webkit-scrollbar-thumb) {
        background: #334155;
        border-radius: 10px;
    }

</style>