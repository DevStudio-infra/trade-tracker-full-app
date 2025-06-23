"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ShoppingBag, Plus, Calendar, Users, FileText, Package } from "lucide-react";

// Mock orders data
const mockOrders = [
  {
    id: 1,
    name: "Wedding Reception - Smith",
    description: "Wedding reception for 150 guests",
    eventDate: "2024-01-20",
    totalGuests: 150,
    status: "planning",
    createdAt: "2024-01-15",
    items: [
      { recipeId: 1, recipeName: "Beef Wellington", servings: 30, multiplier: 5 },
      { recipeId: 2, recipeName: "Caesar Salad", servings: 150, multiplier: 1 },
      { recipeId: 3, recipeName: "Chocolate Cake", servings: 150, multiplier: 3 },
    ],
  },
  {
    id: 2,
    name: "Corporate Lunch - TechCorp",
    description: "Business lunch for company meeting",
    eventDate: "2024-01-18",
    totalGuests: 25,
    status: "confirmed",
    createdAt: "2024-01-12",
    items: [
      { recipeId: 1, recipeName: "Margherita Pizza", servings: 25, multiplier: 2 },
      { recipeId: 2, recipeName: "Mixed Salad", servings: 25, multiplier: 1 },
    ],
  },
];

const mockShoppingLists = [
  {
    id: 1,
    orderId: 1,
    name: "Wedding Shopping List",
    items: [
      { ingredient: "Beef tenderloin", quantity: "15 lbs", category: "Meat" },
      { ingredient: "Puff pastry", quantity: "6 packages", category: "Bakery" },
      { ingredient: "Mushrooms", quantity: "5 lbs", category: "Vegetables" },
      { ingredient: "Romaine lettuce", quantity: "20 heads", category: "Vegetables" },
      { ingredient: "Parmesan cheese", quantity: "2 lbs", category: "Dairy" },
    ],
    totalCost: 245.5,
    status: "pending",
  },
];

const mockProductionLists = [
  {
    id: 1,
    orderId: 1,
    name: "Wedding Production Schedule",
    tasks: [
      { task: "Prep vegetables", estimatedTime: "2 hours", assignedTo: "Kitchen Staff", priority: "high" },
      { task: "Prepare beef wellington", estimatedTime: "4 hours", assignedTo: "Head Chef", priority: "high" },
      { task: "Make salad dressing", estimatedTime: "30 minutes", assignedTo: "Prep Cook", priority: "medium" },
      { task: "Assemble desserts", estimatedTime: "3 hours", assignedTo: "Pastry Chef", priority: "medium" },
    ],
    totalTime: "9.5 hours",
    status: "scheduled",
  },
];

export default function OrdersPage() {
  const [orders, setOrders] = useState(mockOrders);
  const [shoppingLists, setShoppingLists] = useState(mockShoppingLists);
  const [productionLists, setProductionLists] = useState(mockProductionLists);
  const [showCreateOrder, setShowCreateOrder] = useState(false);
  const [selectedOrder, setSelectedOrder] = useState<any>(null);

  const handleCreateOrder = (orderData: any) => {
    const newOrder = {
      id: Date.now(),
      ...orderData,
      status: "planning",
      createdAt: new Date().toISOString().split("T")[0],
      items: [],
    };
    setOrders((prev) => [newOrder, ...prev]);
    setShowCreateOrder(false);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "confirmed":
        return "bg-green-100 text-green-800";
      case "planning":
        return "bg-yellow-100 text-yellow-800";
      case "completed":
        return "bg-blue-100 text-blue-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  return (
    <div className="container mx-auto p-6">
      <div className="mb-6">
        <h1 className="text-3xl font-bold tracking-tight flex items-center gap-3">
          <ShoppingBag className="h-8 w-8 text-orange-600" />
          Orders & Production Lists
        </h1>
        <p className="text-muted-foreground mt-2">Manage orders, generate shopping lists, and create production schedules from your recipes.</p>
      </div>

      <Tabs defaultValue="orders" className="space-y-6">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="orders" className="flex items-center gap-2">
            <FileText className="h-4 w-4" />
            Orders ({orders.length})
          </TabsTrigger>
          <TabsTrigger value="shopping" className="flex items-center gap-2">
            <ShoppingBag className="h-4 w-4" />
            Shopping Lists ({shoppingLists.length})
          </TabsTrigger>
          <TabsTrigger value="production" className="flex items-center gap-2">
            <Package className="h-4 w-4" />
            Production Lists ({productionLists.length})
          </TabsTrigger>
        </TabsList>

        <TabsContent value="orders" className="space-y-4">
          <div className="flex justify-between items-center">
            <h2 className="text-xl font-semibold">Orders</h2>
            <Button onClick={() => setShowCreateOrder(true)}>
              <Plus className="h-4 w-4 mr-2" />
              New Order
            </Button>
          </div>

          <div className="grid gap-4">
            {orders.map((order) => (
              <Card key={order.id} className="cursor-pointer hover:shadow-md transition-shadow" onClick={() => setSelectedOrder(order)}>
                <CardHeader>
                  <CardTitle className="flex items-center justify-between">
                    <div>
                      <h3 className="font-semibold">{order.name}</h3>
                      <p className="text-sm text-gray-600 font-normal">{order.description}</p>
                    </div>
                    <Badge className={getStatusColor(order.status)}>{order.status}</Badge>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-3 gap-4 text-sm">
                    <div className="flex items-center gap-2">
                      <Calendar className="h-4 w-4 text-gray-500" />
                      <span>{order.eventDate}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Users className="h-4 w-4 text-gray-500" />
                      <span>{order.totalGuests} guests</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <FileText className="h-4 w-4 text-gray-500" />
                      <span>{order.items.length} recipes</span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}

            {orders.length === 0 && (
              <Card>
                <CardContent className="flex flex-col items-center justify-center py-12">
                  <ShoppingBag className="h-12 w-12 text-gray-400 mb-4" />
                  <h3 className="text-lg font-medium mb-2">No orders yet</h3>
                  <p className="text-gray-500 text-center mb-4">Create your first order to start generating shopping and production lists.</p>
                  <Button onClick={() => setShowCreateOrder(true)}>
                    <Plus className="h-4 w-4 mr-2" />
                    Create First Order
                  </Button>
                </CardContent>
              </Card>
            )}
          </div>
        </TabsContent>

        <TabsContent value="shopping" className="space-y-4">
          <h2 className="text-xl font-semibold">Shopping Lists</h2>

          <div className="grid gap-4">
            {shoppingLists.map((list) => (
              <Card key={list.id}>
                <CardHeader>
                  <CardTitle className="flex items-center justify-between">
                    {list.name}
                    <Badge variant="outline">${list.totalCost}</Badge>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {list.items.map((item, index) => (
                      <div key={index} className="flex justify-between items-center py-2 border-b last:border-b-0">
                        <div>
                          <span className="font-medium">{item.ingredient}</span>
                          <span className="text-sm text-gray-500 ml-2">({item.category})</span>
                        </div>
                        <span className="text-sm">{item.quantity}</span>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            ))}

            {shoppingLists.length === 0 && (
              <Card>
                <CardContent className="flex flex-col items-center justify-center py-12">
                  <ShoppingBag className="h-12 w-12 text-gray-400 mb-4" />
                  <h3 className="text-lg font-medium mb-2">No shopping lists yet</h3>
                  <p className="text-gray-500 text-center">Shopping lists will be generated automatically when you create orders.</p>
                </CardContent>
              </Card>
            )}
          </div>
        </TabsContent>

        <TabsContent value="production" className="space-y-4">
          <h2 className="text-xl font-semibold">Production Lists</h2>

          <div className="grid gap-4">
            {productionLists.map((list) => (
              <Card key={list.id}>
                <CardHeader>
                  <CardTitle className="flex items-center justify-between">
                    {list.name}
                    <Badge variant="outline">{list.totalTime}</Badge>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {list.tasks.map((task, index) => (
                      <div key={index} className="flex justify-between items-center py-2 border-b last:border-b-0">
                        <div>
                          <span className="font-medium">{task.task}</span>
                          <div className="text-sm text-gray-500">
                            {task.assignedTo} • {task.estimatedTime}
                          </div>
                        </div>
                        <Badge variant={task.priority === "high" ? "destructive" : "secondary"}>{task.priority}</Badge>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            ))}

            {productionLists.length === 0 && (
              <Card>
                <CardContent className="flex flex-col items-center justify-center py-12">
                  <Package className="h-12 w-12 text-gray-400 mb-4" />
                  <h3 className="text-lg font-medium mb-2">No production lists yet</h3>
                  <p className="text-gray-500 text-center">Production lists will be generated automatically when you create orders.</p>
                </CardContent>
              </Card>
            )}
          </div>
        </TabsContent>
      </Tabs>

      {/* Create Order Modal */}
      {showCreateOrder && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <Card className="max-w-md w-full">
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                Create New Order
                <Button variant="ghost" size="sm" onClick={() => setShowCreateOrder(false)}>
                  ×
                </Button>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  const formData = new FormData(e.currentTarget);
                  handleCreateOrder({
                    name: formData.get("name"),
                    description: formData.get("description"),
                    eventDate: formData.get("eventDate"),
                    totalGuests: parseInt(formData.get("totalGuests") as string) || 0,
                  });
                }}
                className="space-y-4">
                <Input name="name" placeholder="Order name (e.g., Wedding Reception)" required />
                <Input name="description" placeholder="Brief description" />
                <Input name="eventDate" type="date" required />
                <Input name="totalGuests" type="number" placeholder="Number of guests" min="1" />
                <Button type="submit" className="w-full">
                  Create Order
                </Button>
              </form>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Order Detail Modal */}
      {selectedOrder && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <Card className="max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                {selectedOrder.name}
                <Button variant="ghost" size="sm" onClick={() => setSelectedOrder(null)}>
                  ×
                </Button>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-gray-600">{selectedOrder.description}</p>

              <div className="grid grid-cols-3 gap-4 text-sm">
                <div>
                  <span className="font-medium">Event Date:</span> {selectedOrder.eventDate}
                </div>
                <div>
                  <span className="font-medium">Guests:</span> {selectedOrder.totalGuests}
                </div>
                <div>
                  <span className="font-medium">Status:</span>
                  <Badge className={`ml-2 ${getStatusColor(selectedOrder.status)}`}>{selectedOrder.status}</Badge>
                </div>
              </div>

              <div>
                <h4 className="font-medium mb-2">Order Items:</h4>
                {selectedOrder.items.length === 0 ? (
                  <p className="text-gray-500 text-sm">No recipes added yet.</p>
                ) : (
                  <div className="space-y-2">
                    {selectedOrder.items.map((item: any, index: number) => (
                      <div key={index} className="flex justify-between items-center py-2 border-b">
                        <span className="font-medium">{item.recipeName}</span>
                        <span className="text-sm">
                          {item.servings} servings (×{item.multiplier})
                        </span>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              <div className="flex gap-2 pt-4">
                <Button className="flex-1">Generate Shopping List</Button>
                <Button variant="outline" className="flex-1">
                  Generate Production List
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}
