<script>
	import favicon from "$lib/assets/favicon.svg";
	import "bootstrap/dist/css/bootstrap.min.css";
	import "bootstrap-icons/font/bootstrap-icons.css";

	let { children } = $props();
</script>

<svelte:head>
	<title>Wison Compiler LL</title>
	<link rel="icon" href={favicon} />
</svelte:head>

<nav class="navbar navbar-expand-lg navbar-dark sticky-top mb-4 custom-navbar">
	<div class="container">
		<a class="navbar-brand fw-bold d-flex align-items-center" href="/">
			<div class="logo-icon me-2">
				<i class="bi bi-cpu-fill text-info fs-3"></i>
			</div>
			<span class="brand-text"
				>Wison<span class="text-info">Compiler</span></span
			>
		</a>

		<button
			class="navbar-toggler border-0"
			type="button"
			data-bs-toggle="collapse"
			data-bs-target="#navbarNav"
			aria-label="Abrir menú de navegación">
			<span class="navbar-toggler-icon"></span>
		</button>

		<div class="collapse navbar-collapse" id="navbarNav">
			<ul class="navbar-nav ms-auto">
				<li class="nav-item">
					<a class="nav-link px-3" href="/"
						><i class="bi bi-house-door me-1"></i> Inicio</a
					>
				</li>
				<li class="nav-item">
					<a class="nav-link px-3" href="/editor"
						><i class="bi bi-code-square me-1"></i> Editor</a
					>
				</li>
				<li class="nav-item">
					<a class="nav-link px-3" href="/gramaticas"
						><i class="bi bi-journal-text me-1"></i> Gramaticas</a
					>
				</li>
			</ul>
		</div>
	</div>
</nav>

<main class="container">
	{@render children()}
</main>

<style>
	:global(body) {
		background-color: #0c1425;
		color: #f8fafc;
		min-height: 100vh;
		font-family: "Inter", sans-serif;
	}
	.custom-navbar {
		background: #05080f !important;
		border-bottom: 2px solid #0dcaf0;
		box-shadow: 0 4px 20px rgba(0, 0, 0, 0.5);
		padding: 0.7rem 0;
	}

	.brand-text {
		font-size: 1.5rem;
		letter-spacing: -0.5px;
	}

	.nav-link {
		color: #94a3b8 !important;
		transition: all 0.2s ease;
		font-weight: 500;
		border-radius: 8px;
	}

	.nav-link:hover {
		color: #0dcaf0 !important;
		background: rgba(13, 202, 240, 0.1);
	}

	.logo-icon {
		background: rgba(13, 202, 240, 0.1);
		padding: 5px 10px;
		border-radius: 10px;
		display: flex;
		align-items: center;
		justify-content: center;
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
