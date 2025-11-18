import SearchBar from '@/components/search-bar'

export default function HomePage() {
  return (
    <main className="min-h-screen bg-background">
      <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
        <div className="mb-12 text-center">
          <h1 className="mb-3 text-4xl font-light tracking-tight text-foreground sm:text-5xl text-balance">
            LinkedIn Profile Search
          </h1>
          <p className="text-lg text-muted-foreground font-light">
            Encontre profissionais qualificados através da API Unipile
          </p>
        </div>
        
        <SearchBar />
      </div>
    </main>
  )
}
