import { OrderService } from '../src/lib/services/order.service'

async function main() {
  try {
    const orderService = new OrderService()
    
    console.log('🔍 Probando OrderService...')
    
    // Obtener todos los pedidos (solo para verificar que funciona)
    const orders = await orderService.getOrdersByStatus('PENDING' as any)
    console.log(`✅ Pedidos pendientes encontrados: ${orders.length}`)
    
    console.log('✅ OrderService funciona correctamente')
  } catch (error) {
    console.error('❌ Error en OrderService:', error)
    if (error instanceof Error) {
      console.error('Mensaje:', error.message)
      console.error('Stack:', error.stack)
    }
  }
}

main()